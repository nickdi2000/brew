import {
  getMembers,
  getMemberDetails,
  createMember,
  updateMember,
  deleteMember,
  updateMemberStatus,
  updateMemberPoints
} from '../../api';

const state = {
  members: [],
  currentMember: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1
  },
  filters: {
    status: '',
    membershipLevel: '',
    search: '',
    sort: 'lastName',
    order: 'asc'
  },
  loading: false,
  error: null
};

const getters = {
  membersList: state => state.members,
  currentMember: state => state.currentMember,
  pagination: state => state.pagination,
  filters: state => state.filters,
  isLoading: state => state.loading,
  error: state => state.error,
  membersByStatus: state => status => state.members.filter(member => member.status === status),
  membersByLevel: state => level => state.members.filter(member => member.membershipLevel === level),
  totalPoints: state => state.members.reduce((sum, member) => sum + member.points, 0)
};

const actions = {
  async fetchMembers({ commit, state }, { page = 1, limit = 10 } = {}) {
    try {
      commit('SET_LOADING', true);
      const response = await getMembers({
        ...state.filters,
        page,
        limit
      });
      const { members, pagination } = response.data.data;
      commit('SET_MEMBERS', members);
      commit('SET_PAGINATION', pagination);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch members');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchMemberDetails({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      const response = await getMemberDetails(id);
      commit('SET_CURRENT_MEMBER', response.data.data);
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch member details');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createMember({ commit, dispatch }, memberData) {
    try {
      commit('SET_LOADING', true);
      await createMember(memberData);
      dispatch('fetchMembers'); // Refresh the list
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to create member');
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateMember({ commit, dispatch }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      await updateMember(id, data);
      dispatch('fetchMembers'); // Refresh the list
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to update member');
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteMember({ commit, dispatch }, id) {
    try {
      commit('SET_LOADING', true);
      await deleteMember(id);
      dispatch('fetchMembers'); // Refresh the list
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to delete member');
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateMemberStatus({ commit, dispatch }, { id, status }) {
    try {
      commit('SET_LOADING', true);
      await updateMemberStatus(id, status);
      dispatch('fetchMembers'); // Refresh the list
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to update member status');
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateMemberPoints({ commit, dispatch }, { id, points, operation }) {
    try {
      commit('SET_LOADING', true);
      await updateMemberPoints(id, points, operation);
      dispatch('fetchMembers'); // Refresh the list
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.error || 'Failed to update member points');
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  setFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters);
    dispatch('fetchMembers', { page: 1 }); // Reset to first page with new filters
  },

  clearError({ commit }) {
    commit('SET_ERROR', null);
  }
};

const mutations = {
  SET_MEMBERS(state, members) {
    state.members = members;
  },
  SET_CURRENT_MEMBER(state, member) {
    state.currentMember = member;
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination;
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
