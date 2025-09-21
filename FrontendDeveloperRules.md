# Frontend Development Guidelines

## Project Structure
```
fe/
├── src/
│   ├── api/          # API service and endpoints
│   ├── components/   # Reusable Vue components
│   ├── layouts/      # Layout components and navigation
│   ├── pages/        # Page components (routes)
│   ├── router/       # Vue Router configuration
│   ├── store/        # Vuex store modules
│   └── style.scss    # Global styles
```

## API & Data Handling

### API Response Format
All API responses must follow this structure:
```javascript
{
  success: boolean,    // Operation success status
  message: string,     // Human-readable message
  data: any           // Response payload
}
```

### API Service Usage
- Always use the centralized API service from `api/index.js`
- Never make direct axios calls from components
- Handle API errors consistently using try/catch blocks
- Use the standardized response format in error handling

```javascript
// Good
try {
  const response = await api.get('/endpoint');
  const { data } = response.data;  // Note: response.data.data
} catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
}

// Bad
const response = await axios.get('/endpoint');  // Don't use axios directly
```

## State Management

### Vuex Store Usage
- Use modules for feature-specific state
- Access store in components using composition API
- Always handle loading and error states
- Use getters for derived state
- Mutations must be synchronous
- Use actions for async operations

```javascript
// Component
const store = useStore();
const data = computed(() => store.getters['module/getData']);
await store.dispatch('module/fetchData');

// Store Module
export default {
  namespaced: true,
  state: {
    data: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_DATA(state, data) { state.data = data; }
  },
  actions: {
    async fetchData({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/endpoint');
        commit('SET_DATA', response.data.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
```

## Component Design

### Props and Events
- Always define prop types and defaults
- Use kebab-case for event names
- Emit events with payload
- Validate prop types

```javascript
const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (value) => value.id != null
  }
});

const emit = defineEmits(['item-selected', 'item-deleted']);
```

### Component Structure
- Use composition API with `<script setup>`
- Keep components focused and single-purpose
- Extract reusable logic into composables
- Use slots for flexible content

### Form Handling
- Always use v-model for form inputs
- Implement proper form validation
- Handle loading states during submission
- Show feedback on success/error
- Prevent double submission

## Notifications & Feedback

### Toast Messages
- Use global toast service via `this.$toast`
- Available types: success, error, warning, info
- Always provide clear, actionable messages

```javascript
// Good
this.$toast('Member added successfully', 'success');
this.$toast('Please fill all required fields', 'warning');

// Bad
this.$toast('Error');  // Too vague
this.$toast('Success', 'success');  // Not descriptive
```

## Authentication & Authorization

### Auth State Management
- Check auth state in router guards
- Handle token refresh properly
- Clear auth state on logout
- Store auth tokens securely
- Handle session timeouts

```javascript
// Router Guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

## Common Pitfalls

### Data Handling
- Always check for null/undefined values
- Handle nested object access safely
- Account for loading states
- Show empty states
- Handle pagination properly

### Component Lifecycle
- Clean up event listeners in onUnmounted
- Don't access DOM in setup()
- Handle async data loading properly
- Cancel pending requests on unmount

### Performance
- Use computed properties for derived data
- Implement proper pagination
- Lazy load routes and components
- Use v-show for frequent toggles
- Use v-if for conditional rendering

---
