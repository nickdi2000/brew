import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Landing from '../pages/Landing.vue'
import LandingBrewery from '../pages/LandingBrewery.vue'
import Login from '../pages/Login.vue'
import Contact from '../pages/Contact.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import MemberPortalLayout from '../layouts/MemberPortalLayout.vue'
import Dashboard from '../pages/admin/Dashboard.vue'
import Members from '../pages/admin/Members.vue'
import Settings from '../pages/admin/Settings.vue'
import QRPrint from '../pages/admin/QRPrint.vue'
import Rewards from '../pages/admin/Rewards.vue'
import QRCodes from '../pages/admin/QRCodes.vue'
import MyProfile from '../pages/admin/MyProfile.vue'
import AdminContact from '../pages/admin/Contact.vue'
import SuperAdmin from '../pages/admin/SuperAdmin.vue'
import Welcome from '../pages/member/Welcome.vue'
import MemberPortal from '../pages/member/Portal.vue'
import ComingSoon from '../components/ComingSoon.vue'
import adminNav from '../layouts/admin_nav.json'
import TestBench from '../pages/dev/TestBench.vue'
import QRTest from '../pages/QRTest.vue'
import Gold from '../pages/Gold.vue'
import OrgOnboarding from '../pages/OrgOnboarding.vue'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'landing',
    component: Landing,
    meta: { public: true }
  },
  {
    path: '/breweries',
    name: 'landing-brewery',
    component: LandingBrewery,
    meta: { public: true }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
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
  {
    path: '/gold',
    name: 'gold',
    component: Gold,
    meta: { public: true }
  },
  {
    path: '/onboarding',
    name: 'org-onboarding',
    component: OrgOnboarding,
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try {
              await store.default.dispatch('auth/refreshUserData');
              isAuthenticated = store.default.getters['auth/isAuthenticated'];
            } catch {}
          }

          const currentUser = store.default.getters['auth/currentUser'];
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try { await store.default.dispatch('auth/refreshUserData'); isAuthenticated = store.default.getters['auth/isAuthenticated']; } catch {}
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try { await store.default.dispatch('auth/refreshUserData'); isAuthenticated = store.default.getters['auth/isAuthenticated']; } catch {}
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try { await store.default.dispatch('auth/refreshUserData'); isAuthenticated = store.default.getters['auth/isAuthenticated']; } catch {}
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try { await store.default.dispatch('auth/refreshUserData'); isAuthenticated = store.default.getters['auth/isAuthenticated']; } catch {}
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
          let isAuthenticated = store.default.getters['auth/isAuthenticated'];
          if (!isAuthenticated && store.default.getters['auth/token']) {
            try { await store.default.dispatch('auth/refreshUserData'); isAuthenticated = store.default.getters['auth/isAuthenticated']; } catch {}
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
      // {
      //   path: 'challenges',
      //   name: 'challenges',
      //   component: ComingSoon,
      //   meta: { section: 'Challenges & Events' }
      // },
      {
        path: 'profile',
        name: 'profile',
        component: MyProfile,
        meta: { section: 'Profile' }
      },
      {
        path: 'contact',
        name: 'admin-contact',
        component: AdminContact,
        meta: { section: 'Profile' }
      },
      {
        path: 'guide',
        name: 'guide',
        component: () => import('../pages/admin/Guide.vue'),
        meta: { section: 'Guide' }
      }
      ,
      {
        path: 'super',
        name: 'super-admin',
        component: SuperAdmin,
        meta: { section: 'Guide' }
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
  const isMemberRoute = to.path.startsWith('/members');

  if (to.path.startsWith('/members/') && to.params.code) {
    store.commit('SET_LAST_MEMBER_CODE', String(to.params.code))
  }

  if (isMemberRoute) {
    const memberToken = store.getters['auth/token'];

    if (memberToken && !store.getters['auth/currentUser']) {
      try {
        await store.dispatch('auth/refreshUserData');
      } catch (error) {
        console.error('Failed to refresh member user', error);
        await store.dispatch('auth/resetAuthState');
        next({ name: 'member-home', params: { code: to.params.code } });
        return;
      }
    }

    const currentUser = store.getters['auth/currentUser'];
    let membership = store.getters['auth/currentMembership'];

    if (currentUser && to.params.code) {
      if (!membership || !membership.organization) {
        membership = await store.dispatch('auth/fetchMembershipForCode', {
          code: to.params.code,
          organizationId: membership?.organization?._id || membership?.organization
        });
      }

      if (membership && to.name === 'member-home') {
        next({ name: 'member-portal', params: { code: to.params.code } });
        return;
      }
      if (membership) {
        next();
        return;
      }
    }

    // For member routes without auth, always send to members landing or home for that code
    if (!isPublicRoute) {
      if (to.params.code) {
        next({ name: 'member-home', params: { code: to.params.code } });
      } else {
        next({ name: 'members-landing' });
      }
      return;
    }

    next();
    return;
  }

  let isAuthenticated = store.getters.isAuthenticated;
  const token = store.getters.token;

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

  if (isAuthenticated && to.path === '/login') {
    next('/admin/dashboard');
    return;
  }

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } });
    return;
  }

  if (isPublicRoute) {
    next();
    return;
  }

  if (isAuthenticated) {
    next();
    return;
  }

  next({ name: 'admin-login' });
})

export default router