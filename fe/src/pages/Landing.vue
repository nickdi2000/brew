const parseBooleanParam = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.toLowerCase().trim();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return null;
};

const shouldEnableBetaFromStorage = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(BETA_STORAGE_KEY);
    if (stored === 'true') {
      return true;
    }

    const adminUser = window.localStorage.getItem(ADMIN_USER_KEY);
    return Boolean(adminUser);
  } catch (error) {
    console.error('Failed to read beta flag from localStorage', error);
    return false;
  }
};

const applyBetaState = (value, options = {}) => {
  const { persist = true, syncRoute = true } = options;
  betaEnabled.value = value;

  if (!value) {
    finalizeClose();
  }

  if (persist) {
    setBetaLocalStorage(value);
  }

  if (syncRoute) {
    ensureRouteBetaParam(value);
  }
};

let stopRouteWatcher = null;

const cleanupRouteWatcher = () => {
  if (typeof stopRouteWatcher === 'function') {
    stopRouteWatcher();
    stopRouteWatcher = null;
  }
};
<template>
  <div class="min-h-screen bg-gray-950 font-sans text-gray-100">
    <transition name="beta-overlay-fade">
      <div
        v-if="overlayVisible"
        class="fixed inset-0 z-40 bg-gray-950/70 backdrop-blur-sm"
        aria-hidden="true"
        role="presentation"
        @click.self="closeBetaModal"
      ></div>
    </transition>
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/90 backdrop-blur">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-3">
          <img src="/images/brew-tokens-logo.png" alt="BrewTokens Logo" class="h-12 w-12" />
          <span class="text-2xl font-extrabold tracking-wide text-white">BrewTokens</span>
        </div>
        <div class="hidden items-center space-x-6 md:flex">
          <router-link to="/contact" class="text-base font-medium text-gray-300 transition hover:text-white">Contact</router-link>
          <router-link to="/login" class="btn btn-secondary px-5 py-2 text-base">Login</router-link>
        </div>
        <button class="btn btn-secondary px-4 py-2 text-sm md:hidden">Menu</button>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative overflow-hidden pt-32 pb-24 text-gray-100">
      <div class="absolute inset-0">
        <img :src="heroQrCode" alt="Guests scanning BrewTokens QR code" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/80 to-indigo-900/70"></div>
      </div>

      <div class="relative z-10">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div class="space-y-8 text-center lg:col-span-7 lg:text-left">
              <div class="inline-flex items-center justify-center space-x-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-medium text-indigo-200 lg:justify-start">
                <Icon icon="mdi:lightning-bolt" class="h-4 w-4" />
                <span>Modern loyalty for taprooms</span>
              </div>
              <h1 class="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Revolutionize Rewards with a Single QR Code
              </h1>
              <p class="mx-auto max-w-2xl text-lg text-gray-200 sm:text-xl lg:mx-0">
                BrewTokens gives breweries, coffee shops, and neighborhood hangouts a premium loyalty experience—no hardware installs, no integrations, just effortless delight.
              </p>
              <div class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                <button
                  class="btn btn-primary px-8 py-3 text-lg font-semibold"
                  type="button"
                  @click="focusBetaCard"
                >
                  Get started
                </button>
                <router-link to="/contact" class="btn btn-secondary px-8 py-3 text-lg font-semibold">Contact us</router-link>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <article v-for="highlight in heroHighlights" :key="highlight.title" class="rounded-2xl border border-white/10 bg-white/10 p-5 text-left">
                  <Icon :icon="highlight.icon" class="h-6 w-6 text-indigo-300" />
                  <h3 class="mt-3 text-base font-semibold text-white">{{ highlight.title }}</h3>
                  <p class="mt-2 text-sm text-gray-300">{{ highlight.copy }}</p>
                </article>
              </div>
            </div>

            <div class="lg:col-span-5">
              <component
                :is="betaEnabled ? BetaSignupCard : LandingRegistrationCard"
                ref="betaCardRef"
                :highlight="betaEnabled ? betaHighlight : registrationHighlight"
                :aria-hidden="staticCardHidden"
                :class="staticCardClass"
                @login-request="handleRegistrationLoginClick"
                @focus-card="handleFocusCard"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <transition name="beta-card-modal" appear>
      <div v-if="floatingCardVisible" class="beta-card-modal">
        <BetaSignupCard
          v-if="betaEnabled"
          ref="modalCardRef"
          :card-style="floatingCardStyle"
          :highlight="true"
          :is-modal="true"
          @close="closeBetaModal"
        />
      </div>
    </transition>

    <!-- Feature Sections -->
    <section
      v-for="section in featureSections"
      :key="section.id"
      :id="section.id"
      :class="['py-24', section.background]"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div :class="['space-y-6 lg:col-span-6', section.reverse ? 'lg:order-last' : '']">
            <div class="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              <Icon :icon="section.badgeIcon" class="h-4 w-4" />
              <span>{{ section.badge }}</span>
            </div>
            <h2 class="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{{ section.title }}</h2>
            <p class="text-lg text-gray-300">{{ section.description }}</p>
            <ul class="space-y-4">
              <li v-for="bullet in section.bullets" :key="bullet.text" class="flex items-start space-x-3 text-base text-gray-200">
                <Icon :icon="bullet.icon" class="mt-1 h-5 w-5 flex-shrink-0 text-indigo-300" />
                <span>{{ bullet.text }}</span>
              </li>
            </ul>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                v-for="metric in section.metrics"
                :key="metric.label"
                class="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p class="text-3xl font-bold text-white">{{ metric.value }}</p>
                <p class="mt-1 text-sm text-gray-300">{{ metric.label }}</p>
              </div>
            </div>
          </div>

          <div :class="['lg:col-span-6', section.reverse ? 'lg:order-first' : '']">
            <div class="rounded-3xl border border-white/10 bg-black/30 p-4 shadow-2xl">
              <img :src="section.image" :alt="section.imageAlt" class="h-full w-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- White Label Section -->
    <section class="bg-gray-900 py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div class="space-y-6 lg:col-span-6">
            <div class="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
              <Icon icon="mdi:palette-outline" class="h-4 w-4" />
              <span>White label ready</span>
            </div>
            <h2 class="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Launch it as your own</h2>
            <p class="text-lg text-gray-300">
              Ship a loyalty experience that looks and feels like a native app for your taproom. From logos and colors to domains and copy, BrewTokens disappears behind your brand.
            </p>
            <ul class="space-y-4">
              <li v-for="highlight in whiteLabelHighlights" :key="highlight.text" class="flex items-start space-x-3 text-base text-gray-200">
                <Icon :icon="highlight.icon" class="mt-1 h-5 w-5 flex-shrink-0 text-indigo-300" />
                <span>{{ highlight.text }}</span>
              </li>
            </ul>
            <div class="flex flex-col gap-4 sm:flex-row">
              <router-link to="/login" class="btn btn-primary px-8 py-3 text-lg font-semibold">Get Started</router-link>
              <router-link to="/contact" class="btn btn-secondary px-8 py-3 text-lg font-semibold">Book a Demo</router-link>
            </div>
          </div>
          <div class="lg:col-span-6">
            <div class="rounded-3xl border border-white/10 bg-black/30 p-4 shadow-2xl">
              <img :src="whiteLabelBrewery" alt="White-labeled BrewTokens rewards app for breweries" class="h-full w-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section id="get-started" class="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 py-24 text-center text-white">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="inline-flex items-center justify-center space-x-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold">
          <Icon icon="mdi:rocket-launch" class="h-4 w-4" />
          <span>Launch in under 15 minutes</span>
        </div>
        <h2 class="mt-6 text-4xl font-bold sm:text-5xl">Unleash BrewTokens today</h2>
        <p class="mt-4 text-lg text-indigo-100">
          Elevate your loyalty game with our QR-powered system. Engage guests, unlock repeat visits, and own the entire experience.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/login" class="btn btn-primary px-10 py-4 text-lg font-semibold">Create your venue</a>
          <a href="/contact" class="btn btn-secondary px-10 py-4 text-lg font-semibold">Chat with our team</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 bg-gray-950 py-12 text-gray-400">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div class="flex items-center space-x-3">
          <img src="/images/brew-tokens-logo.png" alt="BrewTokens Logo" class="h-10 w-10" />
          <div>
            <p class="text-lg font-semibold text-white">BrewTokens</p>
            <p class="text-sm text-gray-500">Rewards crafted for craft venues</p>
          </div>
        </div>
        <div class="flex items-center space-x-4 text-sm">
          <a href="/privacy-policy" class="transition hover:text-white">Privacy</a>
          <a href="/terms-of-service" class="transition hover:text-white">Terms</a>
          <a href="/contact" class="transition hover:text-white">Support</a>
          <a href="/members/gordon" class="transition hover:text-white">Sample Portal</a>
        </div>
        <p class="text-xs text-gray-500">&copy; {{ currentYear }} BrewTokens. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import heroQrCode from '@/assets/images/hero-qr-code.png';
import qrAwardBrewery from '@/assets/images/qr-award-brewery.png';
import qrCode from '@/assets/images/qr-code.png';
import singleQr from '@/assets/images/single-qr.png';
import BetaSignupCard from '@/components/marketing/BetaSignupCard.vue';
import LandingRegistrationCard from '@/components/marketing/LandingRegistrationCard.vue';
import whiteLabelBrewery from '/images/white-label-brewery.png';

const currentYear = new Date().getFullYear();
const route = useRoute();
const router = useRouter();

const heroHighlights = [
  {
    title: 'No POS integration',
    copy: 'Launch loyalty instantly without touching your existing tech stack.',
    icon: 'mdi:link-variant-off',
  },
  {
    title: 'Guests love it',
    copy: 'Customers enroll and redeem in seconds using their phones.',
    icon: 'mdi:heart-outline',
  },
  {
    title: 'Live insights',
    copy: 'Track redemptions, visits, and VIPs in real time from one dashboard.',
    icon: 'mdi:chart-bell-curve-cumulative',
  },
];

const featureSections = [
  {
    id: 'award-points',
    title: 'Award points effortlessly',
    description: 'Scan one QR after the tab closes to instantly drop points into a guest\'s wallet. No friction, just smiles.',
    bullets: [
      { text: 'Trigger rewards with a single tap and a quick scan.', icon: 'mdi:flash-outline' },
      { text: 'Reward regulars and first-timers without juggling punch cards.', icon: 'mdi:account-group-outline' },
      { text: 'Automate offers that keep craft fans coming back.', icon: 'mdi:repeat-variant' },
    ],
    metrics: [
      { value: '92%', label: 'faster reward fulfillment' },
      { value: '3x', label: 'more repeat taproom visits' },
    ],
    image: qrAwardBrewery,
    imageAlt: 'Team member awarding loyalty points via QR scan',
    reverse: false,
    badge: 'Award points',
    badgeIcon: 'mdi:qrcode-check',
    background: 'bg-gray-950',
  },
  {
    id: 'easy-join',
    title: 'Let guests join in seconds',
    description: 'One QR joins your guests to your loyalty program, checks their balance, and guides them to the next reward.',
    bullets: [
      { text: 'Capture emails and phone numbers without clunky forms.', icon: 'mdi:email-variant' },
      { text: 'Works on any device—no apps or downloads required.', icon: 'mdi:cellphone-link' },
      { text: 'Automatic SMS and email nudges keep engagement high.', icon: 'mdi:bell-ring-outline' },
    ],
    metrics: [
      { value: '30s', label: 'average signup time' },
      { value: '68%', label: 'opt in to marketing' },
    ],
    image: qrCode,
    imageAlt: 'Guest joining BrewTokens loyalty from a QR code',
    reverse: true,
    badge: 'Guest experience',
    badgeIcon: 'mdi:account-star-outline',
    background: 'bg-gray-900',
  },
  {
    id: 'single-qr',
    title: 'Manage everything with one QR',
    description: 'Admin, guest onboarding, redemptions, and analytics all live behind the same dynamic code—no juggling links.',
    bullets: [
      { text: 'Control campaigns and switch offers instantly from HQ.', icon: 'mdi:remote-desktop' },
      { text: 'Surface top fans and segment guests in real time.', icon: 'mdi:trophy-outline' },
      { text: 'Sync data with your CRM via secure exports and webhooks.', icon: 'mdi:cloud-sync-outline' },
    ],
    metrics: [
      { value: '1', label: 'QR to run your entire program' },
      { value: '24/7', label: 'self-serve access for staff' },
    ],
    image: singleQr,
    imageAlt: 'Overview of BrewTokens admin dashboard',
    reverse: false,
    badge: 'Operational control',
    badgeIcon: 'mdi:shield-lock-outline',
    background: 'bg-gray-950',
  },
];

const whiteLabelHighlights = [
  {
    text: 'Drop in your logo, colors, and typography without touching code.',
    icon: 'mdi:brush-outline',
  },
  {
    text: 'Serve the app from your domain with a secure, mobile-ready experience.',
    icon: 'mdi:web',
  },
  {
    text: 'Tailor copy, offers, and automations to match each location or concept.',
    icon: 'mdi:storefront-outline',
  },
];

const overlayVisible = ref(false);
const floatingCardVisible = ref(false);
const staticCardHidden = ref(false);
const betaHighlight = ref(false);
const isCardAnimating = ref(false);
const floatingCardStyle = ref({});
const betaCardRef = ref(null);
const modalCardRef = ref(null);
const betaEnabled = ref(false);
const registrationHighlight = ref(false);

const BETA_STORAGE_KEY = 'beta';
const ADMIN_USER_KEY = 'adminUser';

const staticCardClass = computed(() => ({
  'pointer-events-none select-none opacity-0': staticCardHidden.value,
}));

const animationDurationMs = 460;
const transitionEasing = 'cubic-bezier(0.33, 1, 0.68, 1)';
const transitionProperty = `top ${animationDurationMs}ms ${transitionEasing}, left ${animationDurationMs}ms ${transitionEasing}, transform ${animationDurationMs}ms ${transitionEasing}, width ${animationDurationMs}ms ${transitionEasing}, height ${animationDurationMs}ms ${transitionEasing}, max-height ${animationDurationMs}ms ${transitionEasing}, opacity 220ms ease-in-out`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => {
      resolve();
    });
  });

const normalizeQueryValue = (value) => {
  if (Array.isArray(value)) {
    return value[value.length - 1];
  }
  return value ?? undefined;
};

const getBetaFlagFromRoute = () => parseBooleanParam(normalizeQueryValue(route.query.beta));

const buildFloatingStyleFromRect = (rect) => ({
  position: 'fixed',
  top: `${rect.top}px`,
  left: `${rect.left}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  zIndex: 60,
  transform: 'translate3d(0, 0, 0)',
  transition: transitionProperty,
  opacity: 1,
});

const getHeroCardElement = () => betaCardRef.value?.getCardEl() ?? null;
const setBetaLocalStorage = (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(BETA_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(BETA_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to set beta flag in localStorage', error);
  }
};

const parseBooleanParam = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.toLowerCase().trim();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return null;
};

const shouldEnableBetaFromStorage = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(BETA_STORAGE_KEY);
    if (stored === 'true') {
      return true;
    }

    const adminUser = window.localStorage.getItem(ADMIN_USER_KEY);
    return Boolean(adminUser);
  } catch (error) {
    console.error('Failed to read beta flag from localStorage', error);
    return false;
  }
};

const applyBetaState = (value, { persist = true } = {}) => {
  betaEnabled.value = value;

  if (!value) {
    finalizeClose();
  }

  if (persist) {
    setBetaLocalStorage(value);
  }
};

let stopRouteWatcher = null;

const cleanupRouteWatcher = () => {
  if (typeof stopRouteWatcher === 'function') {
    stopRouteWatcher();
    stopRouteWatcher = null;
  }
};

const initializeBetaMode = () => {
  const parsed = getBetaFlagFromRoute();

  if (parsed !== null) {
    applyBetaState(parsed, { persist: true, syncRoute: false });
    return;
  }

  const shouldEnable = shouldEnableBetaFromStorage();
  applyBetaState(shouldEnable, { persist: false });
};

const watchRouteChanges = () => {
  cleanupRouteWatcher();

  stopRouteWatcher = watch(
    () => route.query.beta,
    (newValue) => {
      const parsed = getBetaFlagFromRoute();

      if (parsed !== null) {
        applyBetaState(parsed, { persist: false, syncRoute: false });
        return;
      }

      const shouldEnable = shouldEnableBetaFromStorage();
      applyBetaState(shouldEnable, { persist: false });
    },
  );
};

const focusBetaCard = async () => {
  if (!betaEnabled.value) {
    const cardEl = getHeroCardElement();
    if (cardEl && typeof cardEl.scrollIntoView === 'function') {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    registrationHighlight.value = true;
    await wait(280);
    registrationHighlight.value = false;
    return;
  }

  if (isCardAnimating.value) {
    return;
  }

  if (floatingCardVisible.value) {
    modalCardRef.value?.focusEmailInput();
    return;
  }

  const cardEl = getHeroCardElement();
  if (!cardEl) {
    return;
  }

  isCardAnimating.value = true;
  betaHighlight.value = true;

  if (typeof cardEl.scrollIntoView === 'function') {
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  await wait(280);

  const rect = cardEl.getBoundingClientRect();

  overlayVisible.value = true;
  floatingCardVisible.value = true;
  floatingCardStyle.value = buildFloatingStyleFromRect(rect);

  await nextTick();
  staticCardHidden.value = true;

  await nextFrame();

  floatingCardStyle.value = {
    ...floatingCardStyle.value,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(90vw, 34rem)',
    height: 'auto',
    maxHeight: 'min(85vh, 40rem)',
  };

  await wait(animationDurationMs);

  modalCardRef.value?.focusEmailInput();
  isCardAnimating.value = false;
};

const finalizeClose = () => {
  floatingCardVisible.value = false;
  overlayVisible.value = false;
  staticCardHidden.value = false;
  betaHighlight.value = false;
  isCardAnimating.value = false;
  floatingCardStyle.value = {};
};

const closeBetaModal = async () => {
  if (!betaEnabled.value) {
    return;
  }

  if (!floatingCardVisible.value || isCardAnimating.value) {
    if (!isCardAnimating.value) {
      overlayVisible.value = false;
    }
    return;
  }

  const cardEl = getHeroCardElement();

  if (!cardEl) {
    floatingCardStyle.value = {
      ...floatingCardStyle.value,
      opacity: 0,
      transform: 'translate(-50%, -55%) scale(0.96)',
    };

    await wait(animationDurationMs);
    finalizeClose();
    return;
  }

  isCardAnimating.value = true;
  staticCardHidden.value = false;
  betaHighlight.value = true;

  await nextTick();

  const rect = cardEl.getBoundingClientRect();
  floatingCardStyle.value = {
    ...floatingCardStyle.value,
    height: `${rect.height}px`,
    maxHeight: `${rect.height}px`,
  };

  await nextFrame();

  floatingCardStyle.value = {
    ...floatingCardStyle.value,
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    transform: 'translate3d(0, 0, 0)',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    maxHeight: `${rect.height}px`,
  };

  await wait(animationDurationMs);

  finalizeClose();
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeBetaModal();
  }
};

const handleRegistrationLoginClick = () => {
  closeBetaModal();
};

const handleFocusCard = () => {
  if (betaEnabled.value) {
    focusBetaCard();
    return;
  }

  registrationHighlight.value = true;
  wait(animationDurationMs).then(() => {
    registrationHighlight.value = false;
  });
};

let previousBodyOverflow = '';

watch(overlayVisible, (visible) => {
  if (typeof document === 'undefined') {
    return;
  }

  if (visible) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = previousBodyOverflow;
  }
});

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('keydown', handleKeydown);
  initializeBetaMode();
  watchRouteChanges();
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }

  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow;
  }

  cleanupRouteWatcher();
});
</script>