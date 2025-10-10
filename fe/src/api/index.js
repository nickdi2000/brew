import axios from 'axios';
import store from '../store';
import router from '../router';

// Create a cancellation token source for managing requests
let cancelTokenSource = axios.CancelToken.source();

const isCurrentRouteMember = () => {
  const currentRoute = router.currentRoute?.value;
  return currentRoute?.path?.startsWith('/members') || currentRoute?.name?.toString().startsWith('member');
};

const isMemberRequest = (url = '') => {
  const normalized = url.toLowerCase();
  
  // First check: if we're on an admin route, always use admin token
  const currentRoute = router.currentRoute?.value;
  const isOnAdminRoute = currentRoute?.path?.startsWith('/admin');
  const isOnMemberRoute = currentRoute?.path?.startsWith('/members') || currentRoute?.name?.toString().startsWith('member');
  
  // If we're on an admin route, always use admin token regardless of API endpoint URL
  if (isOnAdminRoute) {
    return false;
  }
  
  // If we're on a member route, use member token
  if (isOnMemberRoute) {
    return true;
  }
  
  // For programmatic API calls (no route context), check specific member portal endpoints
  // Be more specific to avoid false positives with /api/memberships (admin endpoint)
  const memberPortalEndpoints = [
    '/members/', // Member portal routes
    '/member/',  // Legacy member routes
    '/memberships/by-code/', // Public membership lookup by code
    '/memberships/by-organization/' // Membership lookup by organization (used in member context)
  ];
  
  if (memberPortalEndpoints.some((endpoint) => normalized.includes(endpoint))) {
    return true;
  }
  
  // Check if URL contains a specific member code
  const lastMemberCode = store.getters.lastMemberCode;
  if (lastMemberCode && normalized.includes(`/members/${String(lastMemberCode).toLowerCase()}`)) {
    return true;
  }
  
  // Default to admin for all other API endpoints
  return false;
};

const determineLogoutOptions = (url = '') => ({
  routeType: isMemberRequest(url) ? 'member' : 'admin',
  redirect: true
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3391/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const isMember = isMemberRequest(config.url);
    const token = isMember
      ? store.getters['auth/token']
      : store.getters.token;
    // Prefer org from member's current membership when making member requests
    const currentMembership = store.getters['auth/currentMembership'];
    const currentOrganizationId = isMember
      ? (currentMembership?.organization?._id || currentMembership?.organization || store.getters['organization/currentOrganizationId'])
      : store.getters['organization/currentOrganizationId'];
    
    const isDemoSession = store.state.isDemoSession;

    // Define public endpoints that don't need auth token
    const publicEndpoints = [
      '/organization/by-code/',
      '/waitlist',
      '/health',
      '/auth/google/login',
      '/auth/google/admin/login',
      '/auth/refresh'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    console.log(`🚀 API Request to ${config.url}:`, {
      method: config.method,
      isMemberRequest: isMember,
      currentPath: router.currentRoute?.value?.path,
      currentRouteName: router.currentRoute?.value?.name,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'none',
      adminToken: store.getters.token ? `${store.getters.token.substring(0, 10)}...` : 'none',
      memberToken: store.getters['auth/token'] ? `${store.getters['auth/token'].substring(0, 10)}...` : 'none',
      organizationId: currentOrganizationId,
      isPublicEndpoint,
      tokenSource: isMember ? 'member' : 'admin'
    });
    
    // Only add auth token for non-public endpoints
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
      // Add organization ID to headers if available and not a public endpoint
    if (currentOrganizationId && !isPublicEndpoint) {
      config.headers['X-Organization-ID'] = currentOrganizationId;
      // Note: organizationId query parameter is no longer added automatically
      // The backend derives the organization from the authenticated user's context
    }

    // Add membership ID to headers if available (normalized id key support)
    const membershipId = currentMembership?.id || currentMembership?._id;
    if (membershipId && !isPublicEndpoint) {
      config.headers['X-Membership-ID'] = membershipId;
    }
    
    // Add cancel token to request
    config.cancelToken = cancelTokenSource.token;

    // Allow API calls during demo sessions so the demo user behaves like real
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Validate API response structure
const validateResponseStructure = (data) => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response format: Response must be an object');
  }

  if (!('success' in data)) {
    throw new Error('Invalid response format: Missing "success" field');
  }

  if (!('message' in data)) {
    throw new Error('Invalid response format: Missing "message" field');
  }

  if (!('data' in data)) {
    throw new Error('Invalid response format: Missing "data" field');
  }

  return {
    data: data.data,
    message: data.message,
    success: data.success
  };
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    try {
      // Validate and transform response
      const validatedResponse = validateResponseStructure(response.data);
      
      // If the response indicates failure, reject the promise
      if (!validatedResponse.success) {
        return Promise.reject({
          response: {
            data: validatedResponse,
            status: response.status
          }
        });
      }

      // Return the validated response
      response.data = validatedResponse;
      return response;
    } catch (error) {
      console.error('API Response validation error:', error);
      return Promise.reject({
        response: {
          data: {
            success: false,
            message: error.message,
            data: null
          },
          status: response.status
        }
      });
    }
  },
  async (error) => {
    const originalRequest = error.config;
    console.log('❌ API Error Response:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      isRetry: !!originalRequest?._retry
    });

    // Handle authentication errors (401 only). Do NOT treat 404 as auth error.
    if (error.response?.status === 401) {
      console.log('🔑 Auth error detected:', {
        status: error.response?.status,
        isRetry: !!originalRequest?._retry,
        endpoint: originalRequest?.url
      });

      // If the 401 originated from the refresh endpoint itself, do not attempt another refresh
      if (originalRequest?.url && originalRequest.url.includes('/auth/refresh')) {
        console.log('⛔ 401 from /auth/refresh detected — clearing auth and redirecting');
        cancelPendingRequests('Refresh endpoint failed - logging out');
        const options = determineLogoutOptions(originalRequest.url);
        store.dispatch('logout', options);
        if (options.routeType === 'admin') {
          router.push('/login');
        } else {
          const memberCode = store.getters.lastMemberCode;
          router.push(memberCode ? `/members/${memberCode}` : '/members');
        }
        return Promise.reject(error);
      }

      // If we get an auth error during a retry, logout
      if (originalRequest._retry) {
        console.log('🚪 Logging out due to retry failure');
        // Cancel all pending requests before logout
        cancelPendingRequests('Authentication failed - logging out');
        const options = determineLogoutOptions(originalRequest.url);
        store.dispatch('logout', options);
        if (options.routeType === 'admin') {
          router.push('/login');
        } else {
          const memberCode = store.getters.lastMemberCode;
          router.push(memberCode ? `/members/${memberCode}` : '/members');
        }
        return Promise.reject(error);
      }

      // Try to refresh the token
      try {
        console.log('🔄 Attempting token refresh...');
        originalRequest._retry = true;
        
        // Determine if this is a member or admin request
        const isMember = isMemberRequest(originalRequest.url);
        const currentRefreshToken = isMember 
          ? store.getters['auth/refreshToken']
          : store.getters.refreshToken;
        
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await api.post('/auth/refresh', {
          refreshToken: currentRefreshToken
        });
        const { token, refreshToken, refreshTokenExpiresAt } = response.data.data;
        
        console.log('✅ Token refresh successful');
        // Update the tokens in the appropriate store
        if (isMember) {
          store.commit('auth/SET_TOKEN', token);
          store.commit('auth/SET_REFRESH_TOKEN', refreshToken);
          store.commit('auth/SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
        } else {
          store.commit('SET_TOKEN', token);
          store.commit('SET_REFRESH_TOKEN', refreshToken);
          store.commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
        }
        
        // Update the failed request's token and retry
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log('🔄 Retrying original request with new token');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.status);
        // If refresh fails, cancel pending requests and logout
        cancelPendingRequests('Token refresh failed - logging out');
        const options = determineLogoutOptions(originalRequest.url);
        store.dispatch('logout', options);
        if (options.routeType === 'admin') {
          router.push('/login');
        } else {
          const memberCode = store.getters.lastMemberCode;
          router.push(memberCode ? `/members/${memberCode}` : '/members');
        }
        return Promise.reject(error);
      }
    }

    // Handle other common errors
    let errorResponse = error.response?.data;

    // If the error response doesn't match our format, create a standardized one
    if (!errorResponse || !('success' in errorResponse)) {
      const statusMessages = {
        403: 'Access forbidden',
        404: 'Resource not found',
        500: 'Server error occurred',
        ECONNABORTED: 'Request timeout'
      };

      const message = error.code === 'ECONNABORTED' 
        ? statusMessages.ECONNABORTED
        : statusMessages[error.response?.status] || 'An unexpected error occurred';

      errorResponse = {
        success: false,
        message,
        data: error.response?.data || null
      };
    }

    // Handle specific status codes
    if (error.response?.status === 403) {
      console.error('Access forbidden');
      // Redirect based on request context
      const isMember = isMemberRequest(originalRequest?.url || '');
      if (isMember) {
        const memberCode = store.getters.lastMemberCode;
        if (memberCode) router.push(`/members/${memberCode}`);
        else router.push('/members');
      } else {
        router.push('/admin');
      }
    }

    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: errorResponse.message,
      data: errorResponse.data
    });
    
    // Return a rejected promise with the standardized error format
    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: errorResponse
      }
    });
  }
);

// API endpoints
const signupForBeta = (email) => api.post('/waitlist', { email });
const submitContactRequest = (payload) => api.post('/contact', payload);
const checkHealth = () => api.get('/health');

// Member management API functions
const getMembers = (params = {}) => api.get('/memberships', { params });
const getMemberDetails = (id) => api.get(`/memberships/${id}`);
const createMember = (data) => api.post('/memberships', data);
const updateMember = (id, data) => api.put(`/memberships/${id}`, data);
const deleteMember = (id) => api.delete(`/memberships/${id}`);
const updateMemberStatus = (id, status) => api.patch(`/memberships/${id}/status`, { status });
const updateMemberPoints = (id, points, operation = 'add') => api.patch(`/memberships/${id}/points`, { points, operation });

// Organization management API functions
const getOrganization = async () => {
  console.log('📞 Calling getOrganization API');
  const response = await api.get('/organization');
  console.log('📦 Organization API Response:', response.data);
  return response;
};
const getSuperOrganizations = async (passcode) => {
  const response = await api.get('/super/organizations', {
    headers: {
      'X-Super-Passcode': passcode
    }
  });
  return response.data;
};
const getOrganizationByCode = (code) => api.get(`/organization/by-code/${code}`);
const updateOrganization = (data) => api.put('/organization', data);
const uploadOrganizationBanner = (imageData) => {
  console.log('🚀 Uploading banner image to API');
  return api.post('/organization/banner-image', { imageData });
};

// QR Codes (Awarding points) management API functions
const getAwardQRCodes = (params = {}) => api.get('/qr-codes', { params });
const createAwardQRCode = (data) => api.post('/qr-codes', data);
const updateAwardQRCode = (id, data) => api.put(`/qr-codes/${id}`, data);
const deleteAwardQRCode = (id) => api.delete(`/qr-codes/${id}`);

// Function to cancel all pending requests and create a new token source
export const cancelPendingRequests = (message = 'Operation cancelled by user') => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel(message);
  }
  // Create new cancel token source for future requests
  cancelTokenSource = axios.CancelToken.source();
};

// Authentication functions
const register = async (userData) => {
  try {
    console.log('📝 Sending registration request:', {
      breweryName: userData.breweryName,
      email: userData.email,
      hasPassword: !!userData.password
    });

    try {
      window.gtag_report_conversion;
    } catch (err) {
      console.error('Google tag conversion error:', err);
    }

    // Cancel any pending token refresh attempts
    cancelPendingRequests('New registration attempt');

    const response = await api.post('/auth/register', userData);
    console.log('✅ Registration successful:', {
      hasToken: !!response.data.data.token,
      organizationName: response.data.data.organization?.name
    });
    
    return response;
  } catch (error) {
    console.error('❌ Registration API error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const googleLogin = async (credential, organizationCode) => {
  try {
    console.log('🔍 Sending Google login request (v2):', { 
      credentialLength: credential?.length,
      credentialStart: credential?.substring(0, 50) + '...',
      organizationCode
    });

    // Cancel any pending token refresh attempts
    cancelPendingRequests('New login attempt');

    // First, exchange the authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code: credential,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      redirect_uri: window.location.origin,
      grant_type: 'authorization_code'
    });

    if (!tokenResponse.data.id_token) {
      throw new Error('Failed to get ID token from Google');
    }

    // Determine endpoint based on presence of organization code (member vs admin)
    const endpoint = organizationCode ? '/auth/google/login' : '/auth/google/admin/login';

    // Now send the ID token to our backend
    const response = await api.post(endpoint, {
      token: tokenResponse.data.id_token,
      code: organizationCode
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;
  } catch (error) {
    console.error('❌ Google login API error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Demo login function (development only)
const demoLogin = async (organizationCode) => {
  try {
    console.log('🧪 Demo login request:', { organizationCode });

    // Cancel any pending token refresh attempts
    cancelPendingRequests('Demo login attempt');

    // Create a fake JWT token that our backend will recognize as demo
    const header = {
      "alg": "RS256",
      "kid": "demo-key-id",
      "typ": "JWT"
    };

    const payload = {
      "iss": "https://accounts.google.com",
      "azp": "demo-client-id",
      "aud": "demo-client-id", 
      "sub": "demo123456789", // Google user ID
      "email": "sample@brewtokens.com", // Match the seeded demo account
      "email_verified": true,
      "name": "Demo User",
      "picture": "https://via.placeholder.com/96x96/4F46E5/FFFFFF?text=DU",
      "given_name": "Demo",
      "family_name": "User",
      "locale": "en",
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    // Create a fake JWT (base64 encoded header.payload.signature)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const fakeSignature = "demo-signature-not-real";
    
    const demoToken = `${encodedHeader}.${encodedPayload}.${fakeSignature}`;

      const endpoint = organizationCode ? '/auth/google/login' : '/auth/google/admin/login';

      const response = await api.post(endpoint, {
        token: demoToken,
        code: organizationCode
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    return response;
  } catch (error) {
    console.error('❌ Demo login API error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw error;
  }
};

// Export the configured axios instance and API functions
export {
  api as default,
  signupForBeta,
  submitContactRequest,
  checkHealth,
  // Authentication
  register,
  getCurrentUser,
  googleLogin,
  demoLogin,
  // Member management
  getMembers,
  getMemberDetails,
  createMember,
  updateMember,
  deleteMember,
  updateMemberStatus,
  updateMemberPoints,
  // Organization management
  getOrganization,
  getOrganizationByCode,
  updateOrganization,
  uploadOrganizationBanner,
  // QR codes management
  getAwardQRCodes,
  createAwardQRCode,
  updateAwardQRCode,
  deleteAwardQRCode,
  getSuperOrganizations,
};