import { getOrganization, updateOrganization } from '@/api';

const state = {
  config: {
    code: '',
    useCustomDomain: false,
    customDomain: ''
  },
  loading: false,
  error: null
};

const getters = {
  config: state => state.config,
  loading: state => state.loading,
  error: state => state.error
};

const mutations = {
  SET_CONFIG(state, config) {
    state.config = config;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  }
};

const actions = {
  async fetchConfig({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await getOrganization();
      commit('SET_CONFIG', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateConfig({ commit }, configData) {
    commit('SET_LOADING', true);
    try {
      const response = await updateOrganization(configData);
      commit('SET_CONFIG', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
