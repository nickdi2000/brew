const transactionService = require('../services/transactionService');
const { formatResponse, formatError } = require('../utils/responseFormatter');

/**
 * Transactions Controller
 * Exposes endpoints for listing transactions, getting balance, accruing, and redeeming.
 */
module.exports = {
  /**
   * List all transactions for an organization.
   * Query: page, limit, type, sortBy, sortOrder
   */
  async listAll(req, res) {
    try {
      const { page = 1, limit = 20, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const organizationId = req.user.organizationId;

      if (!organizationId) {
        return res.status(400).json(formatError('Organization is required'));
      }

      const Transaction = require('../models/Transaction');
      const Member = require('../models/Member');

      // Build query
      const query = { organization: organizationId };
      if (type) {
        query.type = type;
      }

      // Calculate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with population
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .populate({
            path: 'member',
            select: 'user points avatar',
            populate: {
              path: 'user',
              select: 'email firstName lastName'
            }
          })
          .populate('reward', 'name pointsCost')
          .populate('performedBy', 'email firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Transaction.countDocuments(query)
      ]);

      const result = {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };

      return res.json(formatResponse({ data: result, message: 'Transactions retrieved' }));
    } catch (error) {
      console.error('List all transactions error', { error: error.message, stack: error.stack });
      return res.status(500).json(formatError('Failed to retrieve transactions', error.message));
    }
  },

  /**
   * List transactions for a member.
   * Query: page, limit, type
   */
  async list(req, res) {
    try {
      const { memberId } = req.params;
      const { page = 1, limit = 10, type } = req.query;
      const organizationId = req.user.organizationId;

      if (!memberId || !organizationId) {
        return res.status(400).json(formatError('memberId and organization are required'));
      }

      const result = await transactionService.listTransactions(memberId, organizationId, { page: parseInt(page), limit: parseInt(limit), type });
      return res.json(formatResponse({ data: result, message: 'Transactions retrieved' }));
    } catch (error) {
      console.error('List transactions error', { error: error.message, stack: error.stack });
      return res.status(500).json(formatError('Failed to retrieve transactions', error.message));
    }
  },

  /**
   * Get computed balance for a member.
   */
  async balance(req, res) {
    try {
      const { memberId } = req.params;
      const organizationId = req.user.organizationId;
      if (!memberId || !organizationId) {
        return res.status(400).json(formatError('memberId and organization are required'));
      }
      const balance = await transactionService.getBalance(memberId, organizationId);
      return res.json(formatResponse({ data: { balance }, message: 'Balance retrieved' }));
    } catch (error) {
      console.error('Get balance error', { error: error.message, stack: error.stack });
      return res.status(500).json(formatError('Failed to retrieve balance', error.message));
    }
  },

  /**
   * Accrue points for a member.
   * Body: amount(number>0), metadata(object)
   */
  async accrue(req, res) {
    try {
      const { memberId } = req.params;
      const organizationId = req.user.organizationId;
      const { amount, metadata = {} } = req.body;

      if (!memberId || !organizationId) {
        return res.status(400).json(formatError('memberId and organization are required'));
      }
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json(formatError('amount must be a positive number'));
      }

      const tx = await transactionService.accruePoints({ memberId, organizationId, amount, performedBy: req.user._id, metadata });
      const balance = await transactionService.getBalance(memberId, organizationId);

      return res.status(201).json(formatResponse({ data: { transaction: tx, balance }, message: 'Points accrued' }));
    } catch (error) {
      console.error('Accrue points error', { error: error.message, stack: error.stack });
      return res.status(500).json(formatError('Failed to accrue points', error.message));
    }
  },

  /**
   * Redeem a reward for a member.
   * Body: rewardId(string), metadata(object)
   */
  async redeem(req, res) {
    try {
      const { memberId } = req.params;
      const { rewardId, metadata = {} } = req.body;
      const organizationId = req.user.organizationId;

      if (!memberId || !organizationId) {
        return res.status(400).json(formatError('memberId and organization are required'));
      }
      if (!rewardId) {
        return res.status(400).json(formatError('rewardId is required'));
      }

      const result = await transactionService.redeemReward({
        memberId,
        organizationId,
        rewardId,
        performedBy: req.user._id,
        method: 'redemption',
        metadata
      });
      return res.status(201).json(formatResponse({ data: result, message: 'Reward redeemed' }));
    } catch (error) {
      console.error('Redeem reward error', { error: error.message, stack: error.stack });
      return res.status(400).json(formatError(error.message));
    }
  },

  /**
   * Create a new transaction for a member.
   * Body: amount(number), type('earn'|'adjust'), metadata(object)
   */
  async create(req, res) {
    try {
      const { memberId } = req.params;
      const { amount, type, metadata = {}, rewardId } = req.body;
      const organizationId = req.user.organizationId;

      if (!memberId || !organizationId) {
        return res.status(400).json(formatError('memberId and organization are required'));
      }
      if (typeof amount !== 'number' || !Number.isFinite(amount) || amount === 0) {
        return res.status(400).json(formatError('amount must be a non-zero number'));
      }
      if (!['earn', 'adjust'].includes(type)) {
        return res.status(400).json(formatError('type must be either "earn" or "adjust"'));
      }

      // For manual adjustments by admin
      const method = rewardId ? 'redemption' : 'manual';

      const tx = await transactionService.accruePoints({
        memberId,
        organizationId,
        amount,
        type,
        method,
        reward: rewardId || null,
        performedBy: req.user._id,
        metadata
      });

      const balance = await transactionService.getBalance(memberId, organizationId);

      return res.status(201).json(formatResponse({
        data: { transaction: tx, balance },
        message: 'Transaction created successfully'
      }));
    } catch (error) {
      console.error('Create transaction error', { error: error.message, stack: error.stack });
      return res.status(500).json(formatError('Failed to create transaction', error.message));
    }
  }
};

