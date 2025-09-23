import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Landing from '../pages/Landing.vue'
import Login from '../pages/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import MemberPortalLayout from '../layouts/MemberPortalLayout.vue'
import Dashboard from '../pages/admin/Dashboard.vue'
import Members from '../pages/admin/Members.vue'
import Settings from '../pages/admin/Settings.vue'
import QRPrint from '../pages/admin/QRPrint.vue'
import Rewards from '../pages/admin/Rewards.vue'
import QRCodes from '../pages/admin/QRCodes.vue'
import Analytics from '../pages/admin/Analytics.vue'
import Welcome from '../pages/member/Welcome.vue'
import MemberPortal from '../pages/member/Portal.vue'
import ComingSoon from '../components/ComingSoon.vue'
import adminNav from '../layouts/admin_nav.json'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'landing',
    component: Landing,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'admin-login',
    component: Login,
    meta: { public: true }
  },

  // Legal routes
  {
    path: '/terms-of-service',
    name: 'terms-of-service',
    component: () => import('../pages/legal/TermsOfService.vue'),
    meta: { public: true }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../pages/legal/PrivacyPolicy.vue'),
    meta: { public: true }
  },

  // Member portal routes
  {
    path: '/members',
    component: MemberPortalLayout,
    children: [
      {
        path: ':code',
        name: 'member-home',
        component: Welcome,
        meta: { public: true },
        beforeEnter: async (to, from, next) => {
          const store = await import('@/store');

          // Ensure we pull latest auth state if token exists but user not loaded
          let isAuthenticated = store.default.getters.isAuthenticated;
          if (!isAuthenticated && store.default.getters.token) {
            try {
              await store.default.dispatch('fetchCurrentUser');
              isAuthenticated = store.default.getters.isAuthenticated;
            } catch {}
          }

          const currentUser = store.default.getters.currentUser;
          const membership = store.default.getters['auth/currentMembership'];

          console.log('🔒 Member portal guard:', {
            path: to.fullPath,
            isAuthenticated,
            hasUser: !!currentUser,
            hasMembership: !!membership,
            membershipDetails: membership,
            userDetails: {
              id: currentUser?.id,
              email: currentUser?.email,
              memberships: currentUser?.memberships
            }
          });

          // If authenticated and has membership, redirect to portal
          if (isAuthenticated && currentUser && membership) {
            console.log('✅ Member portal access granted - redirecting to portal');
            next({ name: 'member-portal', params: { code: to.params.code } });
            return;
          }

          // Not authenticated or membership missing: allow, but attempt to fetch membership by code if logged in
          console.log('⚠️ No membership access yet - showing welcome page');
          try {
            if (isAuthenticated && to.params.code) {
              const { default: api } = await import('@/api');
              const resp = await api.get(`/memberships/by-code/${to.params.code}`);
              const m = resp.data?.data || null;
              if (m) {
                await store.default.commit('auth/SET_MEMBERSHIP', m);
                console.log('✅ Membership loaded on navigation:', m);
              }
            }
          } catch (e) {
            console.log('ℹ️ Membership not found for code');
          } finally {
            next();
          }
        }
      }
      ,
      {
        path: ':code/portal',
        name: 'member-portal',
        component: MemberPortal,
        meta: { public: false },
        beforeEnter: async (to, from, next) => {
          const store = await import('@/store');
          let isAuthenticated = store.default.getters.isAuthenticated;
          if (!isAuthenticated && store.default.getters.token) {
            try { await store.default.dispatch('fetchCurrentUser'); isAuthenticated = store.default.getters.isAuthenticated; } catch {}
          }
          const membership = store.default.getters['auth/currentMembership'];
          if (!isAuthenticated) {
            return next({ name: 'member-home', params: { code: to.params.code } });
          }
          if (!membership) {
            try {
              const { default: api } = await import('@/api');
              const resp = await api.get(`/memberships/by-code/${to.params.code}`);
              const m = resp.data?.data || null;
              if (m) store.default.commit('auth/SET_MEMBERSHIP', m);
              else return next({ name: 'member-home', params: { code: to.params.code } });
            } catch {
              return next({ name: 'member-home', params: { code: to.params.code } });
            }
          }
          next();
        }
      }
    ]
  },

  // Admin routes
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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isPublicRoute = to.matched.some(record => record.meta.public);
  const token = store.getters.token;
  let isAuthenticated = store.getters.isAuthenticated;

  // If we have a token but no user, try to fetch the user
  if (token && !isAuthenticated) {
    try {
      console.log('Fetching current user...');
      await store.dispatch('fetchCurrentUser');
      isAuthenticated = store.getters.isAuthenticated;
      console.log('User fetched, authenticated:', isAuthenticated);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      const { cancelPendingRequests } = await import('../api');
      cancelPendingRequests('Auth check failed - logging out');
      await store.dispatch('logout', { redirect: false });
    }
  }

  // If authenticated admin user trying to access public routes
  if (isAuthenticated && to.path === '/login') {
    console.log('Authenticated admin accessing public route, redirecting to admin dashboard');
    next('/admin/dashboard');
    return;
  }

  // Handle authentication for admin routes
  if (requiresAuth && !isAuthenticated) {
    console.log('Auth required but not authenticated, redirecting to admin login');
    next({ name: 'admin-login', query: { redirect: to.fullPath } });
    return;
  }

  // Allow access to public routes
  if (isPublicRoute || isAuthenticated) {
    console.log('Accessing public or authenticated route');
    next();
    return;
  }

  // Catch-all redirect to admin login
  console.log('Redirecting to admin login');
  next({ name: 'admin-login' });
})

export default router