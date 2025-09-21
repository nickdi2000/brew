import { createStore } from 'vuex';
import api from '../api';
import router from '../router';
import members from './modules/members';
import organization from './modules/organization';
import rewards from './modules/rewards';

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
    rewards
  },
  state: {
    user: storage.get('user', true) || null,
    token: storage.get('token', false) || null,
    isAuthenticated: false,
    lastActivity: storage.get('lastActivity', true) || null
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    token: state => state.token,
    lastActivity: state => state.lastActivity
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
    SET_LAST_ACTIVITY(state) {
      const timestamp = new Date().getTime();
      state.lastActivity = timestamp;
      storage.set('lastActivity', timestamp, true);
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
      storage.set('user', null, true);
      storage.set('token', null, false);
      storage.set('lastActivity', null, true);
    }
  },
  
  actions: {
    async login({ commit, dispatch }, { credentials, redirect }) {
      try {
        const response = await api.post('/auth/login', credentials);
        console.log('Login response:', response.data); // Debug log
        
        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        const { token, user } = response.data.data;
        
        // Store auth data
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
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
        tokenValue: state.token ? `${state.token.substring(0, 10)}...` : 'none'
      });

      if (!state.token) {
        console.log('⚠️ No token available for user fetch');
        return null;
      }
      
      try {
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
      }
    },
    
    async logout({ commit }, { redirect = true } = {}) {
      try {
        // Try to call logout endpoint if we have a token
        if (this.state.token) {
          await api.post('/auth/logout');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        commit('CLEAR_AUTH');
        if (redirect) {
          router.push('/login');
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
            const response = await api.post('/auth/refresh');
            const { token } = response.data.data;
            
            console.log('✅ Token refresh successful, updating token and retrying user fetch');
            commit('SET_TOKEN', token);
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
