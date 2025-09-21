# Frontend API Configuration

## Overview

The frontend uses a centralized API configuration system that manages all HTTP requests through a dedicated `api/index.js` file.

## Configuration

### Environment Variables

The API base URL is configured through environment variables in your `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

**Note**: Vite requires the `VITE_` prefix for environment variables to be accessible in the frontend.

### API Configuration File

**Location**: `/src/api/index.js`

This file provides:
- **Axios instance** with base configuration
- **Request/Response interceptors** for common functionality
- **Centralized error handling**
- **Organized API endpoints** by feature
- **Timeout configuration** (10 seconds)

## Usage

### Import the API

```javascript
import { waitlistAPI, healthAPI } from '@/api';
// or
import api from '@/api'; // for custom requests
```

### Available Endpoints

#### Waitlist API
```javascript
// Join waitlist
const response = await waitlistAPI.join('user@example.com');
```

#### Health Check API
```javascript
// Check API health
const response = await healthAPI.check();
```

#### Custom Requests
```javascript
import api from '@/api';

// Custom GET request
const response = await api.get('/custom-endpoint');

// Custom POST request
const response = await api.post('/custom-endpoint', { data: 'value' });
```

## Features

### Request Interceptor
- Automatically adds common headers
- Ready for authentication tokens (commented out)
- Logs outgoing requests in development

### Response Interceptor
- Handles common HTTP errors (404, 500)
- Manages timeout errors
- Provides consistent error logging

### Error Handling
The API configuration provides centralized error handling for:
- **404 errors**: API endpoint not found
- **500 errors**: Server errors
- **Timeout errors**: Request took too long
- **Network errors**: Connection issues

## Environment Setup

### Development
```env
VITE_API_URL=http://localhost:3000/api
```

### Production
```env
VITE_API_URL=https://api.brewtokens.com/api
```

## Benefits

1. **Centralized Configuration**: All API settings in one place
2. **Environment-based URLs**: Easy switching between dev/prod
3. **Consistent Error Handling**: Standardized error responses
4. **Future-proof**: Easy to add authentication, logging, etc.
5. **Type Safety Ready**: Can be extended with TypeScript interfaces
6. **Maintainable**: Clear separation of API logic from components

## Adding New Endpoints

To add a new API endpoint:

1. **Add to the appropriate section** in `/src/api/index.js`:
```javascript
export const newFeatureAPI = {
  create: (data) => api.post('/new-feature', data),
  getAll: () => api.get('/new-feature'),
  getById: (id) => api.get(`/new-feature/${id}`),
  update: (id, data) => api.put(`/new-feature/${id}`, data),
  delete: (id) => api.delete(`/new-feature/${id}`),
};
```

2. **Import in your component**:
```javascript
import { newFeatureAPI } from '@/api';
```

3. **Use in your component**:
```javascript
const response = await newFeatureAPI.create(formData);
```

This approach keeps your components clean and makes API management much easier!
