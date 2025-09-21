const Reward = require('../models/Reward');

class RewardService {
  /**
   * Create a new reward
   * @param {Object} rewardData - The reward data
   * @returns {Promise<Object>} Created reward
   */
  async createReward(rewardData) {
    try {
      const reward = new Reward(rewardData);
      await reward.validate();
      return await reward.save();
    } catch (error) {
      throw new Error(`Error creating reward: ${error.message}`);
    }
  }

  /**
   * Get rewards for an organization with pagination and filters
   * @param {string} organizationId - The organization ID
   * @param {Object} options - Query options (pagination, filters, etc.)
   * @returns {Promise<Object>} Rewards and pagination info
   */
  async getRewards(organizationId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        type = '',
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const query = { organizationId };

      // Add filters
      if (search) {
        query.$text = { $search: search };
      }
      if (type) {
        query.type = type;
      }
      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Build sort object
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute queries in parallel
      const [rewards, total] = await Promise.all([
        Reward.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Reward.countDocuments(query)
      ]);

      return {
        rewards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching rewards: ${error.message}`);
    }
  }

  /**
   * Get a single reward by ID
   * @param {string} rewardId - The reward ID
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Object>} The reward
   */
  async getRewardById(rewardId, organizationId) {
    try {
      const reward = await Reward.findOne({
        _id: rewardId,
        organizationId
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      return reward;
    } catch (error) {
      throw new Error(`Error fetching reward: ${error.message}`);
    }
  }

  /**
   * Update a reward
   * @param {string} rewardId - The reward ID
   * @param {string} organizationId - The organization ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} Updated reward
   */
  async updateReward(rewardId, organizationId, updateData) {
    try {
      const reward = await Reward.findOne({
        _id: rewardId,
        organizationId
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      // Update fields
      Object.assign(reward, updateData);
      await reward.validate();
      return await reward.save();
    } catch (error) {
      throw new Error(`Error updating reward: ${error.message}`);
    }
  }

  /**
   * Delete a reward
   * @param {string} rewardId - The reward ID
   * @param {string} organizationId - The organization ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteReward(rewardId, organizationId) {
    try {
      const result = await Reward.deleteOne({
        _id: rewardId,
        organizationId
      });

      if (result.deletedCount === 0) {
        throw new Error('Reward not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting reward: ${error.message}`);
    }
  }

  /**
   * Update reward quantity
   * @param {string} rewardId - The reward ID
   * @param {string} organizationId - The organization ID
   * @param {number} quantity - The quantity to add (negative for subtract)
   * @returns {Promise<Object>} Updated reward
   */
  async updateRewardQuantity(rewardId, organizationId, quantity) {
    try {
      const reward = await Reward.findOne({
        _id: rewardId,
        organizationId
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      if (reward.quantity === null) {
        throw new Error('Cannot update quantity for unlimited rewards');
      }

      const newQuantity = reward.quantity + quantity;
      if (newQuantity < 0) {
        throw new Error('Insufficient quantity available');
      }

      reward.quantity = newQuantity;
      await reward.validate();
      return await reward.save();
    } catch (error) {
      throw new Error(`Error updating reward quantity: ${error.message}`);
    }
  }
}

module.exports = new RewardService();
