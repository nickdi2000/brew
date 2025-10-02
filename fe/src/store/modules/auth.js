import api, { googleLogin, demoLogin, getCurrentUser } from '@/api';

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
      // Ensure recentTransactions is always an array
      state.membership = {
        ...membership,
        recentTransactions: membership?.recentTransactions || []
      };
    },
    UPDATE_MEMBERSHIP_POINTS(state, points) {
      if (state.membership) {
        state.membership.points = points;
      }
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
        if (data.refreshToken) {
          commit('SET_REFRESH_TOKEN', data.refreshToken, { root: true });
        }
        if (data.refreshTokenExpiresAt) {
          commit('SET_REFRESH_TOKEN_EXPIRES_AT', data.refreshTokenExpiresAt, { root: true });
        }
        
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

        if (!response?.data) {
          throw new Error('Invalid response from server');
        }

        const { success, message, data } = response.data;

        if (!success) {
          throw new Error(message || 'Demo authentication failed');
        }

        if (!data?.token || !data?.user) {
          throw new Error('Missing token or user data in demo response');
        }

        commit('SET_TOKEN', data.token);
        commit('SET_USER', data.user);
        commit('SET_MEMBERSHIP', data.membership);

        commit('SET_TOKEN', data.token, { root: true });
        commit('SET_USER', data.user, { root: true });
        commit('SET_REFRESH_TOKEN', data.refreshToken, { root: true });
        commit('SET_REFRESH_TOKEN_EXPIRES_AT', data.refreshTokenExpiresAt, { root: true });
        commit('SET_DEMO_SESSION', true, { root: true });

        return {
          user: data.user,
          membership: data.membership,
          token: data.token
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
    },

    async refreshUserData({ commit }) {
      try {
        const response = await getCurrentUser();
        console.log('🔄 Refresh user data response:', response.data);
        const { user } = response.data;
        
        commit('SET_USER', user);
        // Find the current membership and update it
        if (user.memberships?.length > 0) {
          const currentMembership = user.memberships[0]; // For now, just use the first membership
          console.log('📅 Loaded membership with', currentMembership.recentTransactions?.length || 0, 'transactions');
          commit('SET_MEMBERSHIP', currentMembership);
        } else {
          console.warn('⚠️ No memberships found in response');
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Failed to refresh user data:', error);
        throw error;
      }
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
