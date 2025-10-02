import api from './index';
import store from '@/store';
import type {
  Reward,
  RewardFormData,
  RewardFilters,
  RewardsResponse
} from '@/types/reward';

export const rewardsApi = {
  /**
   * Get rewards list with pagination and filters
   */
  getRewards: async (
    page = 1,
    limit = 10,
    filters: RewardFilters = {}
  ): Promise<RewardsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.type && { type: filters.type }),
      ...(typeof filters.isActive === 'boolean' && { isActive: filters.isActive.toString() }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder })
    });

    const { data } = await api.get(`/rewards?${params}`);
    return data.data;
  },

  /**
   * Get a single reward by ID
   */
  getReward: async (id: string): Promise<Reward> => {
    const { data } = await api.get(`/rewards/${id}`);
    return data.data;
  },

  /**
   * Create a new reward
   */
  createReward: async (rewardData: RewardFormData): Promise<Reward> => {
    const { data } = await api.post('/rewards', rewardData);
    return data.data;
  },

  /**
   * Update an existing reward
   */
  updateReward: async (id: string, rewardData: Partial<RewardFormData>): Promise<Reward> => {
    const { data } = await api.put(`/rewards/${id}`, rewardData);
    return data.data;
  },

  /**
   * Delete a reward
   */
  deleteReward: async (id: string): Promise<void> => {
    await api.delete(`/rewards/${id}`);
  },

  /**
   * Update reward quantity
   */
  updateQuantity: async (id: string, quantity: number): Promise<Reward> => {
    const { data } = await api.patch(`/rewards/${id}/quantity`, { quantity });
    return data.data;
  },

  /**
   * Redeem a reward
   */
  redeemReward: async (id: string, membershipId?: string): Promise<{ success: boolean; message: string }> => {
    // Get current membership from store
    const currentMembership = store.getters['auth/currentMembership'];
    const currentMembershipId = membershipId || currentMembership?._id;

    // Validate membership ID
    if (!currentMembershipId) {
      throw new Error('No membership ID available for redemption');
    }

    // Get organization ID from store
    const organizationId = store.getters['organization/currentOrganizationId'];
    if (!organizationId) {
      throw new Error('No organization ID available for redemption');
    }

    // Validate reward ID
    if (!id) {
      throw new Error('No reward ID provided for redemption');
    }

    try {
      const { data } = await api.post(`/rewards/${id}/redeem`, {
        membershipId: currentMembershipId,
        organizationId
      });
      return data;
    } catch (error) {
      // Add context to error
      const message = error.response?.data?.message || error.message;
      throw new Error(`Failed to redeem reward: ${message}`);
    }
  }
};
