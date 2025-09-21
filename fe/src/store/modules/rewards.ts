import { rewardsApi } from '@/api/rewards';
import type {
  Reward,
  RewardFormData,
  RewardFilters,
  RewardPagination
} from '@/types/reward';

interface RewardsState {
  rewards: Reward[];
  currentReward: Reward | null;
  loading: boolean;
  error: string | null;
  pagination: RewardPagination;
  filters: RewardFilters;
}

const state = (): RewardsState => ({
  rewards: [],
  currentReward: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    type: undefined,
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
});

const getters = {
  rewardsList: (state: RewardsState) => state.rewards,
  currentReward: (state: RewardsState) => state.currentReward,
  isLoading: (state: RewardsState) => state.loading,
  error: (state: RewardsState) => state.error,
  pagination: (state: RewardsState) => state.pagination,
  filters: (state: RewardsState) => state.filters,
  activeRewardsCount: (state: RewardsState) => 
    state.rewards.filter(reward => reward.isActive && reward.isAvailable).length,
  totalPointsCost: (state: RewardsState) =>
    state.rewards.reduce((total, reward) => total + reward.pointsCost, 0)
};

const actions = {
  async fetchRewards({ commit, state }: any) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      const result = await rewardsApi.getRewards(
        state.pagination.page,
        state.pagination.limit,
        state.filters
      );

      commit('SET_REWARDS', result.rewards);
      commit('SET_PAGINATION', result.pagination);
    } catch (error: any) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchReward({ commit }: any, id: string) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      const reward = await rewardsApi.getReward(id);
      commit('SET_CURRENT_REWARD', reward);
    } catch (error: any) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createReward({ commit, dispatch }: any, rewardData: RewardFormData) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      await rewardsApi.createReward(rewardData);
      await dispatch('fetchRewards');
      return true;
    } catch (error: any) {
      commit('SET_ERROR', error.message);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateReward({ commit, dispatch }: any, { id, data }: { id: string; data: Partial<RewardFormData> }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      await rewardsApi.updateReward(id, data);
      await dispatch('fetchRewards');
      return true;
    } catch (error: any) {
      commit('SET_ERROR', error.message);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteReward({ commit, dispatch }: any, id: string) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      await rewardsApi.deleteReward(id);
      await dispatch('fetchRewards');
      return true;
    } catch (error: any) {
      commit('SET_ERROR', error.message);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateQuantity({ commit, dispatch }: any, { id, quantity }: { id: string; quantity: number }) {
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      await rewardsApi.updateQuantity(id, quantity);
      await dispatch('fetchRewards');
      return true;
    } catch (error: any) {
      commit('SET_ERROR', error.message);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  setFilters({ commit, dispatch }: any, filters: RewardFilters) {
    commit('SET_FILTERS', filters);
    dispatch('fetchRewards');
  },

  setPage({ commit, dispatch }: any, page: number) {
    commit('SET_PAGE', page);
    dispatch('fetchRewards');
  }
};

const mutations = {
  SET_REWARDS(state: RewardsState, rewards: Reward[]) {
    state.rewards = rewards;
  },
  SET_CURRENT_REWARD(state: RewardsState, reward: Reward | null) {
    state.currentReward = reward;
  },
  SET_LOADING(state: RewardsState, loading: boolean) {
    state.loading = loading;
  },
  SET_ERROR(state: RewardsState, error: string | null) {
    state.error = error;
  },
  SET_PAGINATION(state: RewardsState, pagination: RewardPagination) {
    state.pagination = pagination;
  },
  SET_FILTERS(state: RewardsState, filters: RewardFilters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_PAGE(state: RewardsState, page: number) {
    state.pagination.page = page;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
