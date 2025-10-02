import { createStore } from 'vuex';
import api, { register } from '../api';
import router from '../router';
import members from './modules/members';
import organization from './modules/organization';
import rewards from './modules/rewards';
import auth from './modules/auth';
import transactions from './modules/transactions';

// Helper function to handle persistent storage
const storage = {
  get: (key, parseJson = true) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return parseJson ? JSON.parse(item) : item;
    } catch (e) {
      // If JSON parsing fails, return the raw value
      const item = localStorage.getItem(key);
      return parseJson ? null : item;
    }
  },
  set: (key, value, stringifyJson = true) => {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, stringifyJson ? JSON.stringify(value) : value);
      }
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }
};

export default createStore({
  modules: {
    members,
    organization,
    rewards,
    auth,
    transactions
  },
  state: {
    user: storage.get('user', true) || null,
    token: storage.get('token', false) || null,
    refreshToken: storage.get('refreshToken', false) || null,
    refreshTokenExpiresAt: storage.get('refreshTokenExpiresAt', true) || null,
    isAuthenticated: false,
    lastActivity: storage.get('lastActivity', true) || null,
    lastMemberCode: storage.get('lastMemberCode', false) || null,
    fetchingUser: false,
    isDemoSession: storage.get('isDemoSession', true) || false
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    token: state => state.token,
    refreshToken: state => state.refreshToken,
    refreshTokenExpiresAt: state => state.refreshTokenExpiresAt,
    lastActivity: state => state.lastActivity,
    lastMemberCode: state => state.lastMemberCode,
    isDemoSession: state => state.isDemoSession
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      storage.set('user', user, true);
    },
    SET_TOKEN(state, token) {
      state.token = token;
      storage.set('token', token, false);
    },
    SET_REFRESH_TOKEN(state, token) {
      state.refreshToken = token;
      storage.set('refreshToken', token, false);
    },
    SET_REFRESH_TOKEN_EXPIRES_AT(state, timestamp) {
      state.refreshTokenExpiresAt = timestamp;
      storage.set('refreshTokenExpiresAt', timestamp, true);
    },
    SET_LAST_ACTIVITY(state) {
      const timestamp = new Date().getTime();
      state.lastActivity = timestamp;
      storage.set('lastActivity', timestamp, true);
    },
    SET_LAST_MEMBER_CODE(state, code) {
      state.lastMemberCode = code || null;
      storage.set('lastMemberCode', code || '', false);
    },
    SET_FETCHING_USER(state, value) {
      state.fetchingUser = value;
    },
    SET_DEMO_SESSION(state, value) {
      state.isDemoSession = value;
      storage.set('isDemoSession', value, true);
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.refreshTokenExpiresAt = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
      state.fetchingUser = false;
      state.isDemoSession = false;
      storage.set('user', null, true);
      storage.set('token', null, false);
      storage.set('refreshToken', null, false);
      storage.set('refreshTokenExpiresAt', null, true);
      storage.set('lastActivity', null, true);
      storage.set('isDemoSession', false, true);
      // intentionally keep lastMemberCode persisted across logouts
    }
  },

  actions: {
    async updateProfile({ commit }, { firstName, lastName }) {
      try {
        const response = await api.put('/users/profile', { firstName, lastName });
        if (response.data.success) {
          commit('SET_USER', { ...response.data.data });
          return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to update profile');
      } catch (error) {
        throw error.response?.data?.message || 'Failed to update profile';
      }
    },

    async register({ commit, dispatch }, { userData, redirect }) {
      try {
        const response = await register(userData);
        console.log('Registration response:', response.data); // Debug log
        
        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const { token, user, organization, refreshToken, refreshTokenExpiresAt } = response.data.data;
        
        // Store auth data
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        if (refreshToken) {
          commit('SET_REFRESH_TOKEN', refreshToken);
        }
        if (refreshTokenExpiresAt) {
          commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
        }
        commit('SET_LAST_ACTIVITY');

        // Store organization data if available
        if (organization) {
          // You might want to add organization to a separate module
          console.log('New organization created:', organization.name, 'with code:', organization.code);
        }

        // Handle redirect after registration
        const redirectPath = redirect || '/admin';
        await router.push(redirectPath);
        
        // Start session monitoring
        dispatch('startSessionMonitor');
        
        return response.data;
      } catch (error) {
        commit('CLEAR_AUTH');
        throw error;
      }
    },

    async login({ commit, dispatch }, { credentials, redirect }) {
      try {
        const response = await api.post('/auth/login', credentials);
        console.log('Login response:', response.data); // Debug log
        
        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const { token, user, refreshToken, refreshTokenExpiresAt } = response.data.data;
        
        // Store auth data
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        if (refreshToken) {
          commit('SET_REFRESH_TOKEN', refreshToken);
        }
        if (refreshTokenExpiresAt) {
          commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
        }
        commit('SET_LAST_ACTIVITY');

        // Handle redirect after login
        const redirectPath = redirect || '/admin';
        await router.push(redirectPath);
        
        // Start session monitoring
        dispatch('startSessionMonitor');
        
        return response.data;
      } catch (error) {
        commit('CLEAR_AUTH');
        throw error;
      }
    },
    
    async fetchCurrentUser({ commit, state }) {
      console.log('👤 fetchCurrentUser called:', {
        hasToken: !!state.token,
        tokenValue: state.token ? `${state.token.substring(0, 10)}...` : 'none',
        alreadyFetching: state.fetchingUser,
        isAuthenticated: state.isAuthenticated
      });

      if (!state.token) {
        console.log('⚠️ No token available for user fetch');
        return null;
      }

      if (state.isDemoSession) {
        console.log('ℹ️ Demo session active, skipping user fetch');
        return state.user;
      }
      
      // Prevent duplicate calls
      if (state.fetchingUser) {
        console.log('🔄 fetchCurrentUser already in progress, skipping duplicate call');
        return new Promise((resolve) => {
          // Wait for the current fetch to complete
          const checkCompletion = () => {
            if (!state.fetchingUser) {
              resolve(state.user);
            } else {
              setTimeout(checkCompletion, 50);
            }
          };
          checkCompletion();
        });
      }
      
      // If user is already authenticated, skip the call
      if (state.isAuthenticated && state.user) {
        console.log('✅ User already authenticated, skipping fetch');
        return state.user;
      }
      
      try {
        commit('SET_FETCHING_USER', true);
        console.log('🔄 Fetching current user from /auth/me');
        const response = await api.get('/auth/me');
        const { user } = response.data.data;
        console.log('✅ User fetch successful:', { userId: user._id });
        commit('SET_USER', user);
        commit('SET_LAST_ACTIVITY');
        return user;
      } catch (error) {
        console.error('❌ User fetch failed:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          endpoint: '/auth/me'
        });
        commit('CLEAR_AUTH');
        throw error;
      } finally {
        commit('SET_FETCHING_USER', false);
      }
    },
    
    async logout({ commit, state }, { redirect = true, routeType = 'member' } = {}) {
      try {
        // Try to call logout endpoint if we have a token
        if (this.state.token && !state.isDemoSession) {
          await api.post('/auth/logout');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        const memberCode = state.lastMemberCode;
        commit('CLEAR_AUTH');
        if (redirect) {
          if (routeType === 'admin') {
            router.push('/login');
          } else {
            if (memberCode) {
              router.push(`/members/${memberCode}`);
            } else {
              router.push('/members');
            }
          }
        }
      }
    },

    // Initialize auth state
    async initAuth({ dispatch, state, commit }) {
      console.log('🔐 Initializing auth state:', {
        hasToken: !!state.token,
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user
      });

      if (state.token) {
        try {
          console.log('👤 Attempting to fetch current user...');
          await dispatch('fetchCurrentUser');
          
          console.log('✅ User fetch successful, starting session monitor');
          dispatch('startSessionMonitor');
        } catch (error) {
          console.error('❌ Error fetching user:', {
            status: error.response?.status,
            message: error.response?.data?.message
          });
          
          console.log('🔄 Attempting token refresh after user fetch failure');
          try {
            if (!state.refreshToken) {
              throw new Error('No refresh token available');
            }
            const response = await api.post('/auth/refresh', { refreshToken: state.refreshToken });
            const { token, refreshToken, refreshTokenExpiresAt } = response.data.data;
            
            console.log('✅ Token refresh successful, updating token and retrying user fetch');
            commit('SET_TOKEN', token);
            if (refreshToken) {
              commit('SET_REFRESH_TOKEN', refreshToken);
            }
            if (refreshTokenExpiresAt) {
              commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
            }
            await dispatch('fetchCurrentUser');
            dispatch('startSessionMonitor');
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', {
              status: refreshError.response?.status,
              message: refreshError.response?.data?.message
            });
            console.log('🚪 Clearing auth state due to refresh failure');
            commit('CLEAR_AUTH');
          }
        }
      } else {
        console.log('ℹ️ No token found, skipping auth initialization');
      }
    },

    // Monitor user session
    startSessionMonitor({ state, dispatch }) {
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      setInterval(() => {
        const now = new Date().getTime();
        const lastActivity = state.lastActivity;
        
        if (lastActivity && (now - lastActivity > SESSION_TIMEOUT)) {
          console.log('Session timeout - logging out');
          dispatch('logout', { redirect: true });
        }
      }, 60000); // Check every minute
    },

    // Update last activity timestamp
    updateActivity({ commit }) {
      commit('SET_LAST_ACTIVITY');
    }
  }
});
