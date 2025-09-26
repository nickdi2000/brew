import api, { googleLogin, demoLogin } from '@/api';

export default {
  namespaced: true,
  
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    membership: null,
    loading: false,
    error: null
  }),

  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    SET_MEMBERSHIP(state, membership) {
      state.membership = membership;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async handleGoogleLogin({ commit }, { credential, organizationId }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await googleLogin(credential, organizationId);
        console.log('🔐 Auth response:', {
          hasData: !!response?.data,
          data: response?.data,
          status: response?.status
        });

        if (!response?.data) {
          throw new Error('Invalid response from server');
        }

        // The response should be in the format { success, message, data }
        const { success, message, data } = response.data;

        if (!success) {
          throw new Error(message || 'Authentication failed');
        }

        if (!data?.token || !data?.user) {
          console.error('❌ Invalid response data:', data);
          throw new Error('Missing token or user data in response');
        }

        // Update module state
        commit('SET_TOKEN', data.token);
        commit('SET_USER', data.user);
        commit('SET_MEMBERSHIP', data.membership);

        // Mirror to root store so global guards/use can see it
        commit('SET_TOKEN', data.token, { root: true });
        commit('SET_USER', data.user, { root: true });
        
        return {
          user: data.user,
          membership: data.membership
        };
      } catch (error) {
        console.error('Google login error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Failed to login with Google');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async handleDemoLogin({ commit }, { organizationId }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await demoLogin(organizationId);
        console.log('🧪 Demo auth response:', {
          hasData: !!response?.data,
          data: response?.data,
          status: response?.status
        });

        if (!response?.data) {
          throw new Error('Invalid response from server');
        }

        // The response should be in the format { success, message, data }
        const { success, message, data } = response.data;

        if (!success) {
          throw new Error(message || 'Demo authentication failed');
        }

        if (!data?.token || !data?.user) {
          console.error('❌ Invalid demo response data:', data);
          throw new Error('Missing token or user data in demo response');
        }

        // Update module state
        commit('SET_TOKEN', data.token);
        commit('SET_USER', data.user);
        commit('SET_MEMBERSHIP', data.membership);

        // Mirror to root store so global guards/use can see it
        commit('SET_TOKEN', data.token, { root: true });
        commit('SET_USER', data.user, { root: true });
        
        return {
          user: data.user,
          membership: data.membership
        };
      } catch (error) {
        console.error('Demo login error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        commit('SET_ERROR', error.response?.data?.message || error.message || 'Failed to login with demo account');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    logout({ commit }) {
      commit('SET_USER', null);
      commit('SET_TOKEN', null);
      commit('SET_MEMBERSHIP', null);
    }
  },

  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    currentMembership: state => state.membership,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
