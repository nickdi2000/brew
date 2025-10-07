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
    website: '',
    stats: [],
    awardQRCodes: []
  },
  currentOrganizationId: null,
  initialized: false,
  loading: false,
  error: null
};

const getters = {
  config: state => state.config,
  stats: state => state.config.stats ?? [],
  loading: state => state.loading,
  error: state => state.error,
  isInitialized: state => state.initialized,
  organizationCode: state => state.config.code || '',
  currentOrganizationId: state => state.currentOrganizationId
};

const mutations = {
  SET_CONFIG(state, config) {
    // Ensure we maintain default values for any missing properties
    const stats = Array.isArray(config?.stats)
      ? config.stats
      : state.config.stats ?? [];
    const awardQRCodes = Array.isArray(config?.awardQRCodes)
      ? config.awardQRCodes
      : state.config.awardQRCodes ?? [];

    state.config = {
      ...state.config,
      ...config,
      stats,
      awardQRCodes
    };
    // If we have an ID in the config and no current organization is set, set it
    if (config._id && !state.currentOrganizationId) {
      state.currentOrganizationId = config._id;
    }
  },
  SET_CURRENT_ORGANIZATION_ID(state, id) {
    state.currentOrganizationId = id;
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
    if (field === 'stats') {
      state.config[field] = Array.isArray(value) ? value : [];
      return;
    }

    if (field === 'awardQRCodes') {
      state.config[field] = Array.isArray(value) ? value : [];
      return;
    }

    state.config[field] = value;
  }
};

const actions = {
  async initializeStore({ commit, dispatch, state, rootState }) {
    if (state.initialized) {
      console.log('Organization store already initialized, skipping');
      return;
    }
    
    // Skip initialization when unauthenticated (public pages)
    if (!rootState.isAuthenticated || !rootState.token) {
      console.log('Skipping organization initialization - not authenticated');
      return;
    }

    // Skip backend fetches when running a demo session
    if (rootState.isDemoSession) {
      console.log('Demo session detected - skipping organization API calls');
      commit('SET_INITIALIZED', true);
      return;
    }

    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      // Get organization ID from user data
      const user = rootState.user;
      let orgId = null;

      console.log('Initializing organization store for user:', {
        userId: user?._id,
        hasOrganization: !!user?.organization,
        hasOrganizations: user?.organizations?.length > 0
      });

      // Try to get organization ID from different possible locations
      if (user?.organization?._id) {
        orgId = user.organization._id;
      } else if (user?.organization) {
        // Handle case where organization is just the ID
        orgId = user.organization;
      } else if (user?.organizations?.length > 0) {
        // Fallback to organizations array if present
        const firstOrg = user.organizations[0];
        orgId = firstOrg?.id || firstOrg?._id || firstOrg;
      }

      if (orgId) {
        console.log('✅ Setting current organization ID:', orgId);
        commit('SET_CURRENT_ORGANIZATION_ID', orgId);
      } else {
        console.error('❌ No organization ID found in user data. User structure:', user);
        throw new Error('User is not associated with any organization');
      }

      await dispatch('fetchConfig');
      commit('SET_INITIALIZED', true);
      console.log('✅ Organization store initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize organization store:', {
        message: error.message,
        user: rootState.user,
        authenticated: rootState.isAuthenticated
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize organization data';
      commit('SET_ERROR', errorMessage);
      
      // Still mark as initialized to prevent infinite retry loops
      commit('SET_INITIALIZED', true);
      
      // Don't rethrow - let the app continue functioning with degraded state
    } finally {
      commit('SET_LOADING', false);
    }
  },

  setCurrentOrganization({ commit }, organizationId) {
    commit('SET_CURRENT_ORGANIZATION_ID', organizationId);
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
