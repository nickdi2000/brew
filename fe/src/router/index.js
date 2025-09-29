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
import MyProfile from '../pages/admin/MyProfile.vue'
import Welcome from '../pages/member/Welcome.vue'
import MemberPortal from '../pages/member/Portal.vue'
import ComingSoon from '../components/ComingSoon.vue'
import adminNav from '../layouts/admin_nav.json'
import TestBench from '../pages/dev/TestBench.vue'
import QRTest from '../pages/QRTest.vue'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'landing',
    component: Landing,
    meta: { public: true }
  },
  {
    path: '/qr-test',
    name: 'qr-test',
    component: QRTest,
    meta: { public: true }
  },
  {
    path: '/dev/test',
    name: 'dev-test',
    component: TestBench,
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
        path: '',
        name: 'members-landing',
        component: () => import('../pages/member/MembersLanding.vue'),
        meta: { public: true }
      },
      {
        path: ':code',
        name: 'member-home',
        component: Welcome,
        meta: { public: true },
        beforeEnter: async (to, from, next) => {
          const store = await import('@/store');
          // persist member code
          if (to.params.code) {
            store.default.commit('SET_LAST_MEMBER_CODE', String(to.params.code))
          }
          
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

          // If authenticated and has membership, redirect to portal
          if (isAuthenticated && currentUser && membership) {
            next({ name: 'member-portal', params: { code: to.params.code } });
            return;
          }
          next();
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
          // persist member code
          if (to.params.code) {
            store.default.commit('SET_LAST_MEMBER_CODE', String(to.params.code))
          }
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
      },
      {
        path: ':code/rewards',
        name: 'member-rewards',
        component: () => import('../pages/member/PortalRewards.vue'),
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
      },
      {
        path: ':code/transactions',
        name: 'member-transactions',
        component: () => import('../pages/member/Transactions.vue'),
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
      },
      {
        path: ':code/rewards/:id/redeem',
        name: 'member-redeem',
        component: () => import('../pages/member/Redeem.vue'),
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
      },
      {
        path: ':code/scan',
        name: 'member-scan',
        component: () => import('../pages/member/Scan.vue'),
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

  // Legacy/shortcut route: redirect /member/portal -> /members/:code/portal
  {
    path: '/member/portal',
    name: 'member-portal-legacy',
    beforeEnter: async (to, from, next) => {
      try {
        const storeModule = await import('@/store');
        const code = storeModule.default.getters['organization/organizationCode'];
        if (code) {
          return next({ name: 'member-portal', params: { code } });
        }
      } catch {}
      // Fallback to members landing if we don't have code
      return next({ name: 'members-landing' });
    }
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
        path: 'members/new',
        name: 'member-new',
        component: () => import('../pages/admin/MemberEdit.vue'),
        meta: { section: 'Members' }
      },
      {
        path: 'members/:id/edit',
        name: 'member-edit',
        component: () => import('../pages/admin/MemberEdit.vue'),
        meta: { section: 'Members' }
      },
      {
        path: 'snake',
        name: 'snake',
        component: () => import('../components/Snake.vue'),
        meta: { section: 'Snake' }
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
      },
      {
        path: 'profile',
        name: 'profile',
        component: MyProfile,
        meta: { section: 'Profile' }
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

  // Persist member code globally on any members route
  if (to.path.startsWith('/members/') && to.params.code) {
    store.commit('SET_LAST_MEMBER_CODE', String(to.params.code))
  }

  // If we have a token but no user, try to fetch the user
  if (token && !isAuthenticated) {
    try {
      await store.dispatch('fetchCurrentUser');
      isAuthenticated = store.getters.isAuthenticated;
    } catch (error) {
      const { cancelPendingRequests } = await import('../api');
      cancelPendingRequests('Auth check failed - logging out');
      await store.dispatch('logout', { redirect: false });
    }
  }

  // Do not redirect member routes to admin login; keep them in members flow
  const isMemberRoute = to.path.startsWith('/members');

  // If authenticated admin user trying to access public routes
  if (!isMemberRoute && isAuthenticated && to.path === '/login') {
    next('/admin/dashboard');
    return;
  }

  // Handle authentication for admin routes
  if (!isMemberRoute && requiresAuth && !isAuthenticated) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } });
    return;
  }

  // Allow access to public routes
  if (isPublicRoute) {
    next();
    return;
  }

  // Allow access to authenticated routes
  if (isAuthenticated) {
    next();
    return;
  }

  // For non-member unauthenticated, default to admin-login; for member routes, keep them in member landing
  if (isMemberRoute) {
    next();
  } else {
    next({ name: 'admin-login' });
  }
})

export default router