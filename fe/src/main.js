import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import router from './router'
import store from './store'
import { toast } from './plugins/toast'

// Create app instance
const app = createApp(App)

// Use plugins
app.use(store)
app.use(router)
app.use(toast)

// Initialize auth state and activity monitoring
store.dispatch('initAuth').finally(() => {
  // Mount the app after auth initialization
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
