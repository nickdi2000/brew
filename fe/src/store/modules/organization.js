import { getOrganization, updateOrganization } from '@/api';

const state = {
  config: {
    code: '',
    useCustomDomain: false,
    customDomain: '',
    bannerImage: '',
    name: '',
    description: '',
    email: '',
    website: ''
  },
  initialized: false,
  loading: false,
  error: null
};

const getters = {
  config: state => state.config,
  loading: state => state.loading,
  error: state => state.error,
  isInitialized: state => state.initialized,
  organizationCode: state => state.config.code || ''
};

const mutations = {
  SET_CONFIG(state, config) {
    // Ensure we maintain default values for any missing properties
    state.config = {
      ...state.config,
      ...config
    };
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized;
  },
  UPDATE_CONFIG_FIELD(state, { field, value }) {
    state.config[field] = value;
  }
};

const actions = {
  async initializeStore({ commit, dispatch, state }) {
    if (state.initialized) return;
    
    try {
      await dispatch('fetchConfig');
      commit('SET_INITIALIZED', true);
    } catch (error) {
      console.error('Failed to initialize organization store:', error);
      commit('SET_ERROR', 'Failed to initialize organization data');
    }
  },

  async fetchConfig({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await getOrganization();
      console.log('Organization response:', response);
      if (response.data?.data) {
        commit('SET_CONFIG', response.data.data);
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch organization data';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateConfig({ commit, dispatch }, configData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await updateOrganization(configData);
      console.log('Update organization response:', response);
      if (response.data?.data) {
        commit('SET_CONFIG', response.data.data);
        return response.data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      const errorMessage = error.message || 'Failed to update organization';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Helper action to update a single field
  async updateConfigField({ commit, dispatch }, { field, value }) {
    commit('UPDATE_CONFIG_FIELD', { field, value });
    return dispatch('updateConfig', { [field]: value });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
