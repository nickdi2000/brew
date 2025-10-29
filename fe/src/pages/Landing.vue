<template>
  <div class="min-h-screen bg-gray-950 font-sans text-gray-100">
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
        <router-link to="/login" class="btn btn-primary px-4 py-2 text-sm md:hidden">Start</router-link>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative overflow-hidden pt-32 pb-24 text-gray-100">
      <div class="absolute inset-0">
        <img :src="heroQrCode" alt="Guests scanning BrewTokens QR code" class="h-full w-full object-contain sm:object-cover" />
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
                  @click="$router.push('/login?tab=register')"
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
              <LandingRegistrationCard
                ref="betaCardRef"
                :highlight="registrationHighlight"
                @login-request="handleRegistrationLoginClick"
                @focus-card="handleFocusCard"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

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

    <!-- Video Tutorial Section -->
    <section class="bg-gray-900 py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="inline-flex items-center justify-center space-x-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-semibold text-indigo-200">
            <Icon icon="mdi:play-circle" class="h-4 w-4" />
            <span>Video Tutorial</span>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">See BrewTokens in action</h2>
          <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Watch our quick walkthrough to discover how easy it is to launch and manage your loyalty program.
          </p>
        </div>

        <div class="mt-12">
          <div
            class="group relative mx-auto max-w-4xl cursor-pointer overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/20"
            @click="openVideoModal"
          >
            <!-- Thumbnail -->
            <div class="relative aspect-video bg-black">
              <img
                src="/videos/dashboard-screenshot.png"
                alt="BrewTokens Tutorial"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <!-- Play Button Overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 group-hover:bg-black/30">
                <div class="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500">
                  <Icon icon="mdi:play" class="h-12 w-12 text-white" />
                </div>
              </div>
              <!-- Duration Badge -->
              <div class="absolute bottom-4 right-4 rounded-lg bg-black/80 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                <Icon icon="mdi:clock-outline" class="mr-1 inline-block h-4 w-4" />
                2:30
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showVideoModal"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          @click="closeVideoModal"
        >
          <!-- Modal Content -->
          <div
            class="relative w-full max-w-6xl"
            @click.stop
          >
            <!-- Close Button -->
            <button
              class="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
              @click="closeVideoModal"
              type="button"
            >
              <Icon icon="mdi:close" class="h-6 w-6" />
            </button>

            <!-- Video Container -->
            <div class="overflow-hidden rounded-2xl shadow-2xl">
              <div class="relative aspect-video bg-black">
                <video
                  ref="videoPlayer"
                  class="h-full w-full"
                  controls
                  autoplay
                  @ended="handleVideoEnded"
                >
                  <source src="/videos/brewtokens-walkthru.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import heroQrCode from '@/assets/images/hero-qr-code.png';
import qrAwardBrewery from '@/assets/images/qr-award-brewery.png';
import qrCode from '@/assets/images/qr-code.png';
import singleQr from '@/assets/images/single-qr.png';
import LandingRegistrationCard from '@/components/marketing/LandingRegistrationCard.vue';
import whiteLabelBrewery from '/images/white-label-brewery.png';
import { useLocation } from '@/composables/useLocation';

const currentYear = new Date().getFullYear();
const { getLocation } = useLocation();

// Video modal state
const showVideoModal = ref(false);
const videoPlayer = ref(null);

// Fetch user location on mount for later use in registration and contact
onMounted(async () => {
  try {
    console.log('Fetching location on landing page');
    let location = await getLocation();
    console.log('Location fetched on landing page:', location);
  } catch (error) {
    console.error('Error fetching location on landing page:', error);
  }
});

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

const registrationHighlight = ref(false);
const betaCardRef = ref(null);

const focusRegistrationCard = async () => {
  const cardEl = betaCardRef.value?.getCardEl?.();
  if (cardEl && typeof cardEl.scrollIntoView === 'function') {
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  registrationHighlight.value = true;
  await new Promise((resolve) => setTimeout(resolve, 280));
  registrationHighlight.value = false;
};

const handleRegistrationLoginClick = () => {
  focusRegistrationCard();
};

const handleFocusCard = () => {
  focusRegistrationCard();
};

// Video modal functions
const openVideoModal = () => {
  showVideoModal.value = true;
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
};

const closeVideoModal = () => {
  showVideoModal.value = false;
  // Restore body scroll
  document.body.style.overflow = '';
  // Pause video when closing
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
};

const handleVideoEnded = () => {
  // Optionally auto-close modal when video ends
  // closeVideoModal();
};
</script>