const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const sinon = require('sinon');

const TransactionService = require('../../services/transactionService');
const Reward = require('../../models/Reward');
const Member = require('../../models/Member');
const Transaction = require('../../models/Transaction');

const mongoTestClient = require('../helpers/mongoTestClient');

describe('TransactionService.redeemReward', () => {
  let supportsTransactions = false;

  before(async () => {
    try {
      await mongoTestClient.connect({ useReplicaSet: true });
      supportsTransactions = true;
      console.info('[TestSetup] Using replica set MongoMemoryServer for transaction tests');
    } catch (error) {
      console.warn('[TestSetup] Replica set MongoMemoryServer unavailable, falling back to single node', {
        error: error.message
      });
      await mongoTestClient.connect({ useReplicaSet: false });
      supportsTransactions = false;
    }
  });

  after(async () => {
    await mongoTestClient.disconnect();
  });

  beforeEach(async () => {
    await mongoTestClient.clearDatabase();
  });

  afterEach(() => {
    sinon.restore();
  });

  async function createMemberAndReward({ points = 500, rewardOverrides = {} } = {}) {
    const organizationId = new mongoose.Types.ObjectId();
    const member = await Member.create({
      user: new mongoose.Types.ObjectId(),
      organization: organizationId,
      points
    });

    await Transaction.create({
      member: member._id,
      organization: organizationId,
      amount: points,
      type: 'earn',
      method: 'manual',
      metadata: { seed: true }
    });

    const rewardPayload = {
      name: rewardOverrides.name || 'Free Drink',
      description: rewardOverrides.description || 'Enjoy a free drink on us',
      pointsCost: rewardOverrides.pointsCost ?? 250,
      type: rewardOverrides.type || 'product',
      organizationId,
      quantity: Object.prototype.hasOwnProperty.call(rewardOverrides, 'quantity') ? rewardOverrides.quantity : 5,
      isActive: rewardOverrides.isActive ?? true,
      expiresAt: rewardOverrides.expiresAt ?? null
    };

    const reward = await Reward.create(rewardPayload);

    return { organizationId, member, reward };
  }

  it('redeems a reward successfully using MongoDB transactions when available', async function testTransactionalRedemption() {
    if (!supportsTransactions) {
      this.skip();
    }

    const { organizationId, member, reward } = await createMemberAndReward();

    const result = await TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString(),
      performedBy: new mongoose.Types.ObjectId().toString(),
      metadata: { source: 'test' }
    });

    assert.ok(result.transaction);
    assert.strictEqual(result.transaction.member.toString(), member._id.toString());
    assert.strictEqual(result.transaction.organization.toString(), organizationId.toString());
    assert.strictEqual(result.transaction.reward.toString(), reward._id.toString());
    assert.strictEqual(result.transaction.type, 'redeem');
    assert.strictEqual(result.transaction.method, 'redemption');
    assert.strictEqual(result.transaction.amount, -reward.pointsCost);

    assert.strictEqual(result.balance, 250);

    const updatedReward = await Reward.findById(reward._id);
    assert.strictEqual(updatedReward.quantity, 4);

    const savedTransaction = await Transaction.findById(result.transaction._id);
    assert.ok(savedTransaction);
    assert.strictEqual(savedTransaction.amount, -reward.pointsCost);
    assert.strictEqual(savedTransaction.metadata.rewardName, reward.name);
  });

  it('falls back to non-transactional logic when transactions are not supported', async () => {
    const startSessionStub = sinon.stub(mongoose, 'startSession').callsFake(async () => {
      throw Object.assign(new Error('Transaction numbers are only allowed on a replica set member or mongos'), {
        code: 20
      });
    });

    const { organizationId, member, reward } = await createMemberAndReward();

    const result = await TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString(),
      performedBy: new mongoose.Types.ObjectId().toString(),
      metadata: { source: 'fallback-test' }
    });

    assert.strictEqual(result.balance, 250);

    const updatedReward = await Reward.findById(reward._id);
    assert.strictEqual(updatedReward.quantity, 4);

    const savedTransaction = await Transaction.findById(result.transaction._id);
    assert.ok(savedTransaction);
    assert.strictEqual(savedTransaction.metadata.source, 'fallback-test');
    assert.strictEqual(savedTransaction.metadata.rewardType, reward.type);

    sinon.assert.calledOnce(startSessionStub);
  });

  it('propagates other MongoDB errors when session creation fails for other reasons', async () => {
    sinon.stub(mongoose, 'startSession').rejects(Object.assign(new Error('AuthFailure'), { code: 18 }));

    const { organizationId, member, reward } = await createMemberAndReward();

    await assert.rejects(() => TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    }));
  });

  it('does not allow redemption when points are insufficient', async () => {
    const { organizationId, member, reward } = await createMemberAndReward({ points: 100 });

    await assert.rejects(() => TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    }), /Insufficient points/);

    const updatedReward = await Reward.findById(reward._id);
    assert.strictEqual(updatedReward.quantity, 5);

    const transactions = await Transaction.find({ reward: reward._id });
    assert.strictEqual(transactions.length, 0);
  });

  it('prevents concurrent redemption causing oversell in fallback mode', async () => {
    sinon.stub(mongoose, 'startSession').callsFake(async () => {
      throw Object.assign(new Error('Transaction numbers are only allowed on a replica set member or mongos'), {
        code: 20
      });
    });

    const { organizationId, member, reward } = await createMemberAndReward({
      rewardOverrides: { quantity: 1 }
    });

    const firstResult = await TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    });

    assert.strictEqual(firstResult.balance, 250);

    await assert.rejects(() => TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    }), /out of stock/);

    const updatedReward = await Reward.findById(reward._id);
    assert.strictEqual(updatedReward.quantity, 0);

    const transactions = await Transaction.find({ reward: reward._id });
    assert.strictEqual(transactions.length, 1);
  });

  it('restores reward quantity if saving transaction fails in fallback mode', async () => {
    sinon.stub(mongoose, 'startSession').callsFake(async () => {
      throw Object.assign(new Error('Transaction numbers are only allowed on a replica set member or mongos'), {
        code: 20
      });
    });

    const { organizationId, member, reward } = await createMemberAndReward();

    const originalSave = Transaction.prototype.save;
    const saveStub = sinon.stub(Transaction.prototype, 'save');
    saveStub.onFirstCall().callsFake(function transitionalSave() {
      return originalSave.apply(this, arguments);
    }).onSecondCall().rejects(new Error('Write conflict'));

    await TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    });

    await assert.rejects(() => TransactionService.redeemReward({
      memberId: member._id.toString(),
      organizationId: organizationId.toString(),
      rewardId: reward._id.toString()
    }), /Write conflict/);

    const updatedReward = await Reward.findById(reward._id);
    assert.strictEqual(updatedReward.quantity, 4);

    saveStub.restore();
  });
});
