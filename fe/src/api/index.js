import axios from 'axios';
import store from '../store';
import router from '../router';

// Create a cancellation token source for managing requests
let cancelTokenSource = axios.CancelToken.source();

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
    const token = store.getters.token;
    console.log(`🚀 API Request to ${config.url}:`, {
      method: config.method,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'none'
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add cancel token to request
    config.cancelToken = cancelTokenSource.token;
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

      // If we get an auth error during a retry, logout
      if (originalRequest._retry) {
        console.log('🚪 Logging out due to retry failure');
        // Cancel all pending requests before logout
        cancelPendingRequests('Authentication failed - logging out');
        store.dispatch('logout');
        router.push('/login');
        return Promise.reject(error);
      }

      // Try to refresh the token
      try {
        console.log('🔄 Attempting token refresh...');
        originalRequest._retry = true;
        const response = await api.post('/auth/refresh', {
          refreshToken: store.getters.refreshToken
        });
        const { token, refreshToken, refreshTokenExpiresAt } = response.data.data;
        
        console.log('✅ Token refresh successful');
        // Update the tokens
        store.commit('SET_TOKEN', token);
        store.commit('SET_REFRESH_TOKEN', refreshToken);
        store.commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
        
        // Update the failed request's token and retry
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log('🔄 Retrying original request with new token');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.status);
        // If refresh fails, cancel pending requests and logout
        cancelPendingRequests('Token refresh failed - logging out');
        store.dispatch('logout');
        router.push('/login');
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
      router.push('/admin'); // Redirect to dashboard on forbidden access
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
const signupForBeta = (email) => api.post('/beta/signup', { email });
const checkHealth = () => api.get('/health');

// Member management API functions
const getMembers = (params = {}) => api.get('/members', { params });
const getMemberDetails = (id) => api.get(`/members/${id}`);
const createMember = (data) => api.post('/members', data);
const updateMember = (id, data) => api.put(`/members/${id}`, data);
const deleteMember = (id) => api.delete(`/members/${id}`);
const updateMemberStatus = (id, status) => api.patch(`/members/${id}/status`, { status });
const updateMemberPoints = (id, points, operation = 'add') => api.patch(`/members/${id}/points`, { points, operation });

// Organization management API functions
const getOrganization = () => api.get('/organization');
const updateOrganization = (data) => api.put('/organization', data);

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

// Export the configured axios instance and API functions
export {
  api as default,
  signupForBeta,
  checkHealth,
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
  updateOrganization,
  // QR codes management
  getAwardQRCodes,
  createAwardQRCode,
  updateAwardQRCode,
  deleteAwardQRCode,
};