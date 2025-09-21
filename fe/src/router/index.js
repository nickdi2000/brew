import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Landing from '../pages/Landing.vue'
import Login from '../pages/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../pages/admin/Dashboard.vue'
import Members from '../pages/admin/Members.vue'
import Settings from '../pages/admin/Settings.vue'
import QRPrint from '../pages/admin/QRPrint.vue'
import Rewards from '../pages/admin/Rewards.vue'
import QRCodes from '../pages/admin/QRCodes.vue'
import Analytics from '../pages/admin/Analytics.vue'
import ComingSoon from '../components/ComingSoon.vue'
import adminNav from '../layouts/admin_nav.json'

const routes = [
  { 
    path: '/', 
    name: 'Landing', 
    component: Landing,
    meta: { public: true }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    meta: { public: true }
  },
  { 
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { 
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { section: 'Dashboard' }
      },
      {
        path: 'members',
        name: 'members',
        component: Members,
        meta: { section: 'Members' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings,
        meta: { section: 'Settings' }
      },
      {
        path: 'qr-print',
        name: 'qr-print',
        component: QRPrint,
        meta: { section: 'Settings' }
      },
      {
        path: 'rewards',
        name: 'rewards',
        component: Rewards,
        meta: { 
          section: 'Rewards',
          async beforeResolve(to, from, next) {
            try {
              await store.dispatch('rewards/fetchRewards')
              next()
            } catch (error) {
              console.error('Failed to fetch rewards:', error)
              next()
            }
          }
        }
      },
      {
        path: 'qr-codes',
        name: 'qr-codes',
        component: QRCodes,
        meta: { section: 'QR Codes' }
      },
      {
        path: 'challenges',
        name: 'challenges',
        component: ComingSoon,
        meta: { section: 'Challenges & Events' }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics,
        meta: { section: 'Analytics' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Handle route-specific beforeResolve hooks
router.beforeResolve(async (to, from, next) => {
  if (to.meta.beforeResolve) {
    await to.meta.beforeResolve(to, from, next)
  } else {
    next()
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Route guard - Current route:', to.path);
  console.log('Auth state:', {
    token: store.getters.token,
    isAuthenticated: store.getters.isAuthenticated,
    user: store.getters.currentUser
  });

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isPublicRoute = to.matched.some(record => record.meta.public)
  const token = store.getters.token
  let isAuthenticated = store.getters.isAuthenticated

  // If we have a token but no user, try to fetch the user
  if (token && !isAuthenticated) {
    try {
      console.log('Fetching current user...');
      await store.dispatch('fetchCurrentUser')
      isAuthenticated = store.getters.isAuthenticated
      console.log('User fetched, authenticated:', isAuthenticated);
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Cancel any pending requests before logout
      const { cancelPendingRequests } = await import('../api')
      cancelPendingRequests('Auth check failed - logging out')
      await store.dispatch('logout', { redirect: false })
    }
  }

  // Handle authentication redirects
  if (requiresAuth && !isAuthenticated) {
    console.log('Auth required but not authenticated, redirecting to login');
    // Save the intended route to redirect after login
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (isAuthenticated) {
    // If authenticated and trying to access public routes like login/landing
    if (to.path === '/login' || to.path === '/') {
      console.log('Authenticated user accessing public route, redirecting to admin');
      next('/admin')
    } else {
      console.log('Authenticated user accessing protected route');
      next()
    }
  } else if (isPublicRoute) {
    // Allow access to public routes when not authenticated
    console.log('Unauthenticated user accessing public route');
    next()
  } else {
    // Default to login for any other case
    console.log('Unauthenticated user accessing protected route, redirecting to login');
    next('/login')
  }
})

export default router