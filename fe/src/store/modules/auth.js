import api, { googleLogin, demoLogin, getCurrentUser } from '@/api';

const MEMBER_STORAGE_KEYS = {
  token: 'memberToken',
  user: 'memberUser',
  membership: 'memberMembership',
  refreshToken: 'memberRefreshToken',
  refreshTokenExpiresAt: 'memberRefreshTokenExpiresAt'
};

const getStoredMemberUser = () => {
  try {
    const stored = localStorage.getItem(MEMBER_STORAGE_KEYS.user);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored member user', error);
    localStorage.removeItem(MEMBER_STORAGE_KEYS.user);
    return null;
  }
};

const getStoredMembership = () => {
  try {
    const stored = localStorage.getItem(MEMBER_STORAGE_KEYS.membership);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored member membership', error);
    localStorage.removeItem(MEMBER_STORAGE_KEYS.membership);
    return null;
  }
};

const fetchMembershipByOrg = async ({ organizationId, organizationCode }) => {
  if (!organizationId && !organizationCode) {
    return null;
  }

  try {
    if (organizationId) {
      const response = await api.get(`/memberships/by-organization/${organizationId}`);
      if (response.data?.data) {
        return response.data.data;
      }
    }
  } catch (error) {
    console.warn('Failed to load membership by organization', error);
  }

  if (organizationCode) {
    try {
      const response = await api.get(`/memberships/by-code/${organizationCode}`);
      return response.data?.data || null;
    } catch (error) {
      console.warn('Failed to load membership by code', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  return null;
};

const resolveMembershipData = async ({ membership, organizationId, organizationCode, user }) => {
  if (membership) {
    return membership;
  }

  const normalizedCode = organizationCode ? String(organizationCode).toLowerCase() : '';

  if (user?.memberships?.length) {
    const match = user.memberships.find(memberRecord => {
      const org = memberRecord.organization || {};
      const candidateCode = (org.code || memberRecord.organizationCode || memberRecord.code || '').toLowerCase();
      return normalizedCode && candidateCode === normalizedCode;
    });

    if (match) {
      return match;
    }
  }

  return fetchMembershipByOrg({ organizationId, organizationCode });
};

export default {
  namespaced: true,

  state: () => ({
    user: getStoredMemberUser(),
    token: localStorage.getItem(MEMBER_STORAGE_KEYS.token) || null,
    refreshToken: localStorage.getItem(MEMBER_STORAGE_KEYS.refreshToken) || null,
    refreshTokenExpiresAt: localStorage.getItem(MEMBER_STORAGE_KEYS.refreshTokenExpiresAt) || null,
    membership: getStoredMembership(),
    // Store all memberships so a member can switch organizations
    memberships: [],
    // Track which organization is currently active
    selectedOrganizationId: localStorage.getItem('memberSelectedOrgId') || null,
    // Track loading state specific to organization switching to prevent duplicate requests
    organizationLoading: false,
    loading: false,
    error: null
  }),

  mutations: {
    SET_USER(state, user) {
      state.user = user;
      if (user) {
        localStorage.setItem(MEMBER_STORAGE_KEYS.user, JSON.stringify(user));
      } else {
        localStorage.removeItem(MEMBER_STORAGE_KEYS.user);
      }
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem(MEMBER_STORAGE_KEYS.token, token);
      } else {
        localStorage.removeItem(MEMBER_STORAGE_KEYS.token);
      }
    },
    SET_REFRESH_TOKEN(state, token) {
      state.refreshToken = token;
      if (token) {
        localStorage.setItem(MEMBER_STORAGE_KEYS.refreshToken, token);
      } else {
        localStorage.removeItem(MEMBER_STORAGE_KEYS.refreshToken);
      }
    },
    SET_REFRESH_TOKEN_EXPIRES_AT(state, expiresAt) {
      state.refreshTokenExpiresAt = expiresAt;
      if (expiresAt) {
        localStorage.setItem(MEMBER_STORAGE_KEYS.refreshTokenExpiresAt, expiresAt);
      } else {
        localStorage.removeItem(MEMBER_STORAGE_KEYS.refreshTokenExpiresAt);
      }
    },
    SET_MEMBERSHIP(state, membership) {
      // Ensure recentTransactions is always an array
      const membershipData = membership ? {
        ...membership,
        recentTransactions: membership?.recentTransactions || []
      } : null;

      state.membership = membershipData;

      // Persist to localStorage
      if (membershipData) {
        localStorage.setItem(MEMBER_STORAGE_KEYS.membership, JSON.stringify(membershipData));
      } else {
        localStorage.removeItem(MEMBER_STORAGE_KEYS.membership);
      }
    },
    SET_MEMBERSHIPS(state, memberships) {
      state.memberships = Array.isArray(memberships) ? memberships : [];
    },
    SET_SELECTED_ORGANIZATION(state, organizationId) {
      state.selectedOrganizationId = organizationId || null;
      if (organizationId) {
        // Persist the selection so the member returns to the same org on refresh
        localStorage.setItem('memberSelectedOrgId', organizationId);
      } else {
        localStorage.removeItem('memberSelectedOrgId');
      }
    },
    SET_ORGANIZATION_LOADING(state, loading) {
      state.organizationLoading = loading;
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
    },
    RESET_STATE(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.refreshTokenExpiresAt = null;
      state.membership = null;
      state.memberships = [];
      state.selectedOrganizationId = null;
      state.organizationLoading = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem(MEMBER_STORAGE_KEYS.token);
      localStorage.removeItem(MEMBER_STORAGE_KEYS.refreshToken);
      localStorage.removeItem(MEMBER_STORAGE_KEYS.refreshTokenExpiresAt);
      localStorage.removeItem(MEMBER_STORAGE_KEYS.user);
      localStorage.removeItem(MEMBER_STORAGE_KEYS.membership);
      localStorage.removeItem('memberSelectedOrgId');
      // Note: last member code is owned by the root store and intentionally preserved
    }
  },

  actions: {
    async handleGoogleLogin({ commit, state }, { credential, code }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);

        const response = await googleLogin(credential, code);
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

        commit('SET_TOKEN', data.token);
        commit('SET_USER', data.user);

        // Store refresh token if provided
        if (data.refreshToken) {
          commit('SET_REFRESH_TOKEN', data.refreshToken);
        }
        if (data.refreshTokenExpiresAt) {
          commit('SET_REFRESH_TOKEN_EXPIRES_AT', data.refreshTokenExpiresAt);
        }

        const memberships = Array.isArray(data.user?.memberships) ? data.user.memberships : [];
        // Cache all memberships so the UI can show switch options even if we only hydrate one membership
        commit('SET_MEMBERSHIPS', memberships);

        const selectedOrgId = state.selectedOrganizationId;

        const membership = await resolveMembershipData({
          membership: data.membership,
          organizationId: selectedOrgId
            || data.membership?.organization?._id
            || data.membership?.organization
            || memberships[0]?.organization?._id
            || memberships[0]?.organization,
          organizationCode: code,
          user: data.user
        });

        if (!membership) {
          throw new Error('No membership found for this organization');
        }

        // Update module state
        commit('SET_MEMBERSHIP', membership);
        if (membership?.organization?._id || typeof membership?.organization === 'string') {
          commit('SET_SELECTED_ORGANIZATION', membership.organization._id || membership.organization);
        }

        return {
          user: data.user,
          membership
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

    async handleDemoLogin({ commit, state }, { code }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);

        const response = await demoLogin(code);

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

        // Store refresh token if provided
        if (data.refreshToken) {
          commit('SET_REFRESH_TOKEN', data.refreshToken);
        }
        if (data.refreshTokenExpiresAt) {
          commit('SET_REFRESH_TOKEN_EXPIRES_AT', data.refreshTokenExpiresAt);
        }

        const memberships = Array.isArray(data.user?.memberships) ? data.user.memberships : [];
        // Cache all memberships so the UI can show switch options even if we only hydrate one membership
        commit('SET_MEMBERSHIPS', memberships);

        const selectedOrgId = state.selectedOrganizationId;

        const membership = await resolveMembershipData({
          membership: data.membership,
          organizationId: selectedOrgId
            || data.membership?.organization?._id
            || data.membership?.organization
            || memberships[0]?.organization?._id
            || memberships[0]?.organization,
          organizationCode: code,
          user: data.user
        });

        if (!membership) {
          throw new Error('No membership found for this organization');
        }

        commit('SET_MEMBERSHIP', membership);
        if (membership?.organization?._id || typeof membership?.organization === 'string') {
          commit('SET_SELECTED_ORGANIZATION', membership.organization._id || membership.organization);
        }
        commit('SET_DEMO_SESSION', true, { root: true });

        return {
          user: data.user,
          membership,
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
      commit('RESET_STATE');
    },

    setSessionAuthenticated({ commit }, { user, token, membership }) {
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      commit('SET_MEMBERSHIP', membership);
    },

    resetAuthState({ commit }) {
      commit('RESET_STATE');
    },

    async fetchMembershipForCode({ commit, state }, { code, organizationId } = {}) {
      if (!code && !organizationId) {
        return null;
      }

      const resolvedMembership = await resolveMembershipData({
        membership: null,
        organizationId: organizationId
          || state.membership?.organization?._id
          || state.membership?.organization
          || state.user?.organization?._id
          || state.user?.organization,
        organizationCode: code,
        user: state.user
      });

      if (resolvedMembership) {
        commit('SET_MEMBERSHIP', resolvedMembership);
        if (resolvedMembership?.organization?._id || typeof resolvedMembership?.organization === 'string') {
          commit('SET_SELECTED_ORGANIZATION', resolvedMembership.organization._id || resolvedMembership.organization);
        }
      }

      return resolvedMembership;
    },

    async refreshUserData({ commit, state }) {
      try {
        const response = await getCurrentUser();
        console.log('🔄 Refresh user data response:', response.data);
        const { user } = response.data;

        commit('SET_USER', user);

        const memberships = Array.isArray(user?.memberships) ? user.memberships : [];
        commit('SET_MEMBERSHIPS', memberships);

        const fallbackOrgId = state.selectedOrganizationId
          || state.membership?.organization?._id
          || state.membership?.organization
          || memberships[0]?.organization?._id
          || memberships[0]?.organization
          || user.organization?._id
          || user.organization;
        // Prefer the explicitly selected organization. Fallbacks ensure backward compatibility with legacy backend responses.

        const membership = await resolveMembershipData({
          membership: null,
          organizationId: fallbackOrgId,
          user
        });

        if (membership) {
          commit('SET_MEMBERSHIP', membership);
          if (membership?.organization?._id || typeof membership?.organization === 'string') {
            commit('SET_SELECTED_ORGANIZATION', membership.organization._id || membership.organization);
          }
        } else {
          console.warn('⚠️ No memberships found in response');
          commit('SET_MEMBERSHIP', null);
        }

        return response.data;
      } catch (error) {
        console.error('❌ Failed to refresh user data:', error);
        throw error;
      }
    },

    async switchOrganization({ commit, dispatch, state }, organizationId) {
      if (!organizationId || state.organizationLoading) {
        return null;
      }

      commit('SET_ORGANIZATION_LOADING', true);
      commit('SET_SELECTED_ORGANIZATION', organizationId);

      try {
        const membership = await fetchMembershipByOrg({ organizationId });
        if (membership) {
          commit('SET_MEMBERSHIP', membership);
          return membership;
        }

        const resolvedMembership = await dispatch('fetchMembershipForCode', { code: null, organizationId });
        if (resolvedMembership) {
          return resolvedMembership;
        }

        commit('SET_MEMBERSHIP', null);
        return null;
      } catch (error) {
        console.error('Error switching organization:', error);
        throw error;
      } finally {
        commit('SET_ORGANIZATION_LOADING', false);
      }
    },

    async refreshCurrentMembership({ commit, state }) {
      try {
        if (!state.membership?.organization) {
          console.warn('[Auth] No current membership to refresh');
          return null;
        }

        const organizationId = state.membership.organization._id || state.membership.organization;
        
        console.info('[Auth] Refreshing current membership', {
          membershipId: state.membership._id,
          organizationId
        });

        const refreshedMembership = await fetchMembershipByOrg({ organizationId });
        
        if (refreshedMembership) {
          console.info('[Auth] Membership refreshed successfully', {
            previousPoints: state.membership?.points,
            newPoints: refreshedMembership.points,
            membershipId: refreshedMembership._id
          });
          
          commit('SET_MEMBERSHIP', refreshedMembership);
          return refreshedMembership;
        }

        console.warn('[Auth] Failed to refresh membership - not found');
        return state.membership;
      } catch (error) {
        console.error('[Auth] Error refreshing membership:', error);
        throw error;
      }
    }
  },

  getters: {
    isAuthenticated: state => !!state.token,
    token: state => state.token,
    refreshToken: state => state.refreshToken,
    refreshTokenExpiresAt: state => state.refreshTokenExpiresAt,
    currentUser: state => state.user,
    currentMembership: state => state.membership,
    memberships: state => state.memberships,
    selectedOrganizationId: state => state.selectedOrganizationId,
    isOrganizationLoading: state => state.organizationLoading,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
