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
    // Defensive validation
    if (!memberId || !organizationId) {
      throw new Error('Member ID and Organization ID are required for balance calculation');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error(`Invalid member ID format: ${memberId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new Error(`Invalid organization ID format: ${organizationId}`);
    }

    try {
      const [sum] = await Transaction.aggregate([
        { 
          $match: { 
            member: new mongoose.Types.ObjectId(memberId), 
            organization: new mongoose.Types.ObjectId(organizationId) 
          } 
        },
        { $group: { _id: null, balance: { $sum: '$amount' } } }
      ]);
      
      const balance = sum?.balance || 0;
      
      // Ensure balance is a valid number
      if (typeof balance !== 'number' || !Number.isFinite(balance)) {
        console.warn('[TransactionService] Invalid balance calculated', {
          memberId,
          organizationId,
          calculatedBalance: balance
        });
        return 0;
      }
      
      return balance;
    } catch (error) {
      console.error('[TransactionService] Error calculating balance', {
        memberId,
        organizationId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to calculate balance: ${error.message}`);
    }
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
    // Comprehensive validation
    if (!memberId || !organizationId) {
      throw new Error('Member ID and Organization ID are required for point accrual');
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error(`Invalid member ID format: ${memberId}`);
    }
    
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new Error(`Invalid organization ID format: ${organizationId}`);
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }

    if (amount === 0) {
      throw new Error('Amount cannot be zero');
    }

    // Validate type and method
    const validTypes = ['earn', 'redeem', 'adjust'];
    const validMethods = ['manual', 'qr_scan', 'redemption', 'system', 'promotion'];
    
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid transaction type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid transaction method: ${method}. Must be one of: ${validMethods.join(', ')}`);
    }

    // Validate performedBy if provided
    if (performedBy && !mongoose.Types.ObjectId.isValid(performedBy)) {
      throw new Error(`Invalid performedBy user ID format: ${performedBy}`);
    }

    // Validate metadata is an object
    if (metadata && (typeof metadata !== 'object' || Array.isArray(metadata))) {
      throw new Error('Metadata must be an object');
    }

    console.info('[TransactionService] Processing point accrual', {
      memberId,
      organizationId,
      amount,
      type,
      method,
      performedBy,
      hasMetadata: !!metadata
    });

    try {
      await this.#assertMemberInOrg(memberId, organizationId);

      const tx = new Transaction({
        member: memberId,
        organization: organizationId,
        amount,
        type,
        method,
        performedBy,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString()
        }
      });
      
      await tx.validate();
      const savedTransaction = await tx.save();
      
      console.info('[TransactionService] Point accrual completed', {
        transactionId: savedTransaction._id,
        memberId,
        amount,
        type
      });
      
      return savedTransaction;
    } catch (error) {
      console.error('[TransactionService] Point accrual failed', {
        memberId,
        organizationId,
        amount,
        type,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
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
    // Comprehensive input validation
    if (!memberId || !organizationId || !rewardId) {
      throw new Error('Member ID, Organization ID, and Reward ID are required for redemption');
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new Error(`Invalid member ID format: ${memberId}`);
    }
    
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new Error(`Invalid organization ID format: ${organizationId}`);
    }
    
    if (!mongoose.Types.ObjectId.isValid(rewardId)) {
      throw new Error(`Invalid reward ID format: ${rewardId}`);
    }

    if (performedBy && !mongoose.Types.ObjectId.isValid(performedBy)) {
      throw new Error(`Invalid performedBy user ID format: ${performedBy}`);
    }

    if (metadata && (typeof metadata !== 'object' || Array.isArray(metadata))) {
      throw new Error('Metadata must be an object');
    }

    console.info('[TransactionService] Processing reward redemption', {
      memberId,
      organizationId,
      rewardId,
      performedBy,
      timestamp: new Date().toISOString()
    });

    try {
      return await this.#attemptRedemptionWithTransaction({
        memberId,
        organizationId,
        rewardId,
        performedBy,
        metadata
      });
    } catch (error) {
      if (this.#isTransactionNotSupportedError(error)) {
        console.warn('[TransactionService] MongoDB transactions not supported; falling back to non-transactional redemption', {
          memberId,
          organizationId,
          rewardId,
          error: error.message
        });

        try {
          return await this.#performRedemption({
            memberId,
            organizationId,
            rewardId,
            performedBy,
            metadata
          });
        } catch (fallbackError) {
          console.error('[TransactionService] Reward redemption failed', {
            memberId,
            organizationId,
            rewardId,
            error: fallbackError.message,
            stack: fallbackError.stack,
            fallback: true
          });
          throw fallbackError;
        }
      }

      console.error('[TransactionService] Reward redemption failed', {
        memberId,
        organizationId,
        rewardId,
        error: error.message,
        stack: error.stack
      });

      throw error;
    }
  }

  async #attemptRedemptionWithTransaction({ memberId, organizationId, rewardId, performedBy, metadata }) {
    const session = await mongoose.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        result = await this.#performRedemption({
          memberId,
          organizationId,
          rewardId,
          performedBy,
          metadata,
          session
        });
      });

      return result;
    } finally {
      try {
        await session.endSession();
      } catch (endError) {
        console.warn('[TransactionService] Failed to end MongoDB session after redemption attempt', {
          memberId,
          organizationId,
          rewardId,
          error: endError.message
        });
      }
    }
  }

  async #performRedemption({ memberId, organizationId, rewardId, performedBy, metadata, session = null }) {
    await this.#assertMemberInOrg(memberId, organizationId);

    let rewardQuery = Reward.findOne({ _id: rewardId, organizationId });
    if (session) {
      rewardQuery = rewardQuery.session(session);
    }

    const reward = await rewardQuery;

    if (!reward) {
      throw new Error('Reward not found');
    }

    if (!reward.isActive) {
      throw new Error('Reward is not active');
    }

    if (reward.isExpired) {
      throw new Error('Reward has expired');
    }

    if (reward.isOutOfStock) {
      throw new Error('Reward is out of stock');
    }

    if (reward.quantity !== null && reward.quantity <= 0) {
      throw new Error('Reward is out of stock');
    }

    if (typeof reward.pointsCost !== 'number' || reward.pointsCost <= 0) {
      throw new Error('Invalid reward points cost');
    }

    const balanceBefore = await this.getBalance(memberId, organizationId);

    if (balanceBefore < reward.pointsCost) {
      console.warn('[TransactionService] Insufficient points for redemption', {
        memberId,
        currentBalance: balanceBefore,
        required: reward.pointsCost,
        deficit: reward.pointsCost - balanceBefore
      });
      throw new Error(`Insufficient points. Required: ${reward.pointsCost}, Available: ${balanceBefore}`);
    }

    console.info('[TransactionService] Creating redemption transaction', {
      memberId,
      rewardId,
      pointsCost: reward.pointsCost,
      balanceBefore,
      rewardQuantity: reward.quantity
    });

    const tx = new Transaction({
      member: memberId,
      organization: organizationId,
      amount: -Math.abs(reward.pointsCost),
      type: 'redeem',
      method: 'redemption',
      reward: reward._id,
      performedBy,
      metadata: {
        ...metadata,
        rewardName: reward.name,
        rewardType: reward.type,
        pointsCost: reward.pointsCost,
        balanceBeforeRedemption: balanceBefore,
        redemptionTimestamp: new Date().toISOString()
      }
    });

    await tx.validate();

    const usingTransaction = Boolean(session);
    const hasLimitedQuantity = reward.quantity !== null;
    const previousQuantity = reward.quantity;
    const rewardDetails = {
      id: reward._id,
      name: reward.name,
      pointsCost: reward.pointsCost
    };
    let savedTransaction;
    let balanceAfter;

    if (usingTransaction) {
      savedTransaction = await tx.save({ session });

      if (hasLimitedQuantity) {
        if (reward.quantity <= 0) {
          throw new Error('Reward is out of stock');
        }

        reward.quantity = reward.quantity - 1;
        await reward.save({ session, validateModifiedOnly: true });

        console.info('[TransactionService] Updated reward quantity', {
          rewardId,
          previousQuantity,
          newQuantity: reward.quantity
        });
      }

      balanceAfter = balanceBefore - reward.pointsCost;

      console.info('[TransactionService] Reward redemption completed successfully', {
        transactionId: savedTransaction._id,
        memberId,
        rewardId,
        pointsDeducted: reward.pointsCost,
        balanceBefore,
        balanceAfter,
        transactional: true
      });

      return {
        transaction: savedTransaction.toObject(),
        balance: balanceAfter,
        reward: rewardDetails
      };
    }

    let hasDecrementedQuantity = false;
    try {
      if (hasLimitedQuantity) {
        if (previousQuantity <= 0) {
          throw new Error('Reward is out of stock');
        }

        const decrementResult = await Reward.updateOne(
          {
            _id: rewardId,
            organizationId,
            quantity: { $gt: 0 }
          },
          {
            $inc: { quantity: -1 },
            $set: { updatedAt: new Date() }
          }
        );

        if (decrementResult.modifiedCount === 0) {
          throw new Error('Reward became out of stock during redemption');
        }

        hasDecrementedQuantity = true;

        console.info('[TransactionService] Updated reward quantity (non-transactional fallback)', {
          rewardId,
          previousQuantity,
          newQuantity: previousQuantity - 1
        });
      }

      savedTransaction = await tx.save();

      balanceAfter = balanceBefore - reward.pointsCost;

      console.info('[TransactionService] Reward redemption completed successfully', {
        transactionId: savedTransaction._id,
        memberId,
        rewardId,
        pointsDeducted: reward.pointsCost,
        balanceBefore,
        balanceAfter,
        transactional: false
      });

      return {
        transaction: savedTransaction.toObject(),
        balance: balanceAfter,
        reward: rewardDetails
      };
    } catch (error) {
      if (savedTransaction) {
        await Transaction.deleteOne({ _id: savedTransaction._id }).catch((cleanupError) => {
          console.error('[TransactionService] Failed to rollback redemption transaction after error', {
            transactionId: savedTransaction._id,
            cleanupError: cleanupError.message
          });
        });
      }

      if (hasDecrementedQuantity) {
        await Reward.updateOne(
          { _id: rewardId, organizationId },
          { $inc: { quantity: 1 }, $set: { updatedAt: new Date() } }
        ).catch((rollbackError) => {
          console.error('[TransactionService] Failed to restore reward quantity after redemption error', {
            rewardId,
            rollbackError: rollbackError.message
          });
        });
      }

      throw error;
    }
  }

  #isTransactionNotSupportedError(error) {
    if (!error) {
      return false;
    }

    const unsupportedCodes = new Set([20, 244, 251]);
    if (typeof error.code === 'number' && unsupportedCodes.has(error.code)) {
      return true;
    }

    const message = error.message || '';
    return message.includes('Transaction numbers are only allowed on a replica set member or mongos')
      || message.includes('No replica set members available')
      || message.includes('ReplicaSetNoPrimary');
  }

  async #assertMemberInOrg(memberId, organizationId) {
    const member = await Member.findOne({ _id: memberId, organization: organizationId });
    if (!member) {
      throw new Error('Member not found in organization');
    }
  }
}

module.exports = new TransactionService();


