import api from './index';
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
  }
};
