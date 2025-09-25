import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import router from './router'
import store from './store'
import { toast } from './plugins/toast'
import vue3GoogleLogin from 'vue3-google-login'
import './utils/logger'  // Import logger to override console methods

// Create app instance
const app = createApp(App)

// Use plugins
app.use(store)
app.use(router)
app.use(toast)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

// Initialize auth state
store.dispatch('initAuth')
  .catch(error => {
    console.warn('Auth initialization error:', error);
  })
  .then(async () => {
    try {
      // Only initialize organization when authenticated
      if (store.getters.isAuthenticated && store.getters.token) {
        await store.dispatch('organization/initializeStore')
      }
    } catch (e) {
      console.warn('Organization initialization error:', e)
    }
  })
  .finally(() => {
    // Mount the app after initialization
    app.mount('#app')
  })

// Setup activity monitoring
app.config.globalProperties.$updateActivity = () => {
  store.dispatch('updateActivity')
}

// Add global click handler for activity monitoring
document.addEventListener('click', () => {
  store.dispatch('updateActivity')
})

// Add global route change handler for activity monitoring
router.beforeEach((to, from, next) => {
  store.dispatch('updateActivity')
  next()
})
