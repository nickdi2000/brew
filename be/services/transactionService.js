const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const Reward = require('../models/Reward');

class TransactionService {
  /**
   * Compute current points balance from transactions for a member in an organization.
   * @param {string} memberId - Member ObjectId string
   * @param {string} organizationId - Organization ObjectId string
   * @returns {Promise<number>} Current balance
   */
  async getBalance(memberId, organizationId) {
    const [sum] = await Transaction.aggregate([
      { $match: { member: new mongoose.Types.ObjectId(memberId), organization: new mongoose.Types.ObjectId(organizationId) } },
      { $group: { _id: null, balance: { $sum: '$amount' } } }
    ]);
    return sum?.balance || 0;
  }

  /**
   * List transactions for a member with pagination.
   * @param {string} memberId
   * @param {string} organizationId
   * @param {{ page?: number, limit?: number, type?: string }} options
   * @returns {Promise<{transactions: any[], pagination: {page:number,limit:number,total:number,pages:number}}>} List and pagination
   */
  async listTransactions(memberId, organizationId, options = {}) {
    const { page = 1, limit = 10, type } = options;
    const query = {
      member: memberId,
      organization: organizationId
    };
    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { createdAt: -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Transaction.countDocuments(query)
    ]);

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Create an accrual (positive) transaction.
   * @param {Object} params
   * @param {string} params.memberId
   * @param {string} params.organizationId
   * @param {number} params.amount - Positive integer number of points to add
   * @param {string|null} params.performedBy - Optional user id
   * @param {Object} params.metadata
   */
  async accruePoints({ memberId, organizationId, amount, type = 'earn', method = 'manual', performedBy = null, metadata = {} }) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('Amount must be a number');
    }

    await this.#assertMemberInOrg(memberId, organizationId);

    const tx = new Transaction({
      member: memberId,
      organization: organizationId,
      amount,
      type,
      method,
      performedBy,
      metadata
    });
    await tx.validate();
    return tx.save();
  }

  /**
   * Redeem a reward by creating a negative transaction and decrementing reward quantity (if limited).
   * The operation is executed in a transaction to ensure consistency.
   * @param {Object} params
   * @param {string} params.memberId
   * @param {string} params.organizationId
   * @param {string} params.rewardId
   * @param {string|null} params.performedBy
   * @param {Object} params.metadata
   * @returns {Promise<{transaction: any, balance: number}>}
   */
  async redeemReward({ memberId, organizationId, rewardId, performedBy = null, metadata = {} }) {
    await this.#assertMemberInOrg(memberId, organizationId);

    const reward = await Reward.findOne({ _id: rewardId, organizationId });
    if (!reward) {
      throw new Error('Reward not found');
    }
    if (!reward.isActive || reward.isExpired) {
      throw new Error('Reward is not available');
    }
    if (reward.quantity !== null && reward.quantity <= 0) {
      throw new Error('Reward is out of stock');
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const balanceBefore = await this.getBalance(memberId, organizationId);
      if (balanceBefore < reward.pointsCost) {
        throw new Error('Insufficient points to redeem');
      }

      const tx = new Transaction({
        member: memberId,
        organization: organizationId,
        amount: -Math.abs(reward.pointsCost),
        type: 'redeem',
        reward: reward._id,
        performedBy,
        metadata: { ...metadata, rewardName: reward.name }
      });
      await tx.validate();
      await tx.save({ session });

      if (reward.quantity !== null) {
        reward.quantity = reward.quantity - 1;
        await reward.save({ session, validateModifiedOnly: true });
      }

      await session.commitTransaction();
      session.endSession();

      const balance = balanceBefore - reward.pointsCost;
      return { transaction: tx.toObject(), balance };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async #assertMemberInOrg(memberId, organizationId) {
    const member = await Member.findOne({ _id: memberId, organization: organizationId });
    if (!member) {
      throw new Error('Member not found in organization');
    }
  }
}

module.exports = new TransactionService();


