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
          <button class="text-base font-medium text-gray-300 transition hover:text-white">Product</button>
          <button class="text-base font-medium text-gray-300 transition hover:text-white">Pricing</button>
          <button class="text-base font-medium text-gray-300 transition hover:text-white">Contact</button>
          <button class="btn btn-secondary px-5 py-2 text-base">Login</button>
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
                <a href="#get-started" class="btn btn-primary px-8 py-3 text-lg font-semibold">Get started</a>
                <button class="btn btn-secondary px-8 py-3 text-lg font-semibold">See it in action</button>
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
              <form @submit.prevent="handleSignup" class="space-y-6 rounded-3xl border border-white/10 bg-gray-950/70 p-8 shadow-2xl backdrop-blur">
                <div class="flex items-center space-x-2 text-sm font-medium text-indigo-200">
                  <Icon icon="mdi:account-plus" class="h-5 w-5" />
                  <span>Request early access</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">Join the BrewTokens beta</h2>
                  <p class="mt-2 text-sm text-gray-400">Tell us how to reach you and we will schedule a guided walkthrough within 24 hours.</p>
                </div>

                <div class="space-y-5">
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-200">Business email</label>
                    <input
                      id="email"
                      v-model="signupForm.email"
                      type="email"
                      name="email"
                      autocomplete="email"
                      placeholder="you@brewery.com"
                      class="mt-2 w-full rounded-xl border border-white/10 bg-gray-900/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      required
                    />
                  </div>
                  <div>
                    <label for="password" class="block text-sm font-medium text-gray-200">Create a password</label>
                    <input
                      id="password"
                      v-model="signupForm.password"
                      type="password"
                      name="password"
                      autocomplete="new-password"
                      placeholder="Minimum 8 characters"
                      class="mt-2 w-full rounded-xl border border-white/10 bg-gray-900/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-3" aria-live="polite">
                  <p v-if="submitError" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{{ submitError }}</p>
                  <p v-if="submitSuccess" class="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">We are brewing something special for you! Check your inbox shortly.</p>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary flex w-full items-center justify-center gap-2 py-3 text-base font-semibold transition"
                  :disabled="isSubmitting"
                  :class="{ 'cursor-not-allowed opacity-70': isSubmitting }"
                >
                  <Icon v-if="isSubmitting" icon="mdi:loading" class="h-5 w-5 animate-spin" />
                  <span>{{ isSubmitting ? 'Submitting...' : 'Request an invite' }}</span>
                </button>

                <p class="text-xs text-gray-500">
                  By submitting, you agree to our
                  <a href="#" class="text-indigo-300 underline-offset-2 hover:underline">Terms</a>
                  and
                  <a href="#" class="text-indigo-300 underline-offset-2 hover:underline">Privacy Policy</a>.
                </p>
              </form>
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
          <a href="#" class="btn btn-primary px-10 py-4 text-lg font-semibold">Create your venue</a>
          <a href="#" class="btn btn-secondary px-10 py-4 text-lg font-semibold">Chat with our team</a>
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
          <a href="#" class="transition hover:text-white">Privacy</a>
          <a href="#" class="transition hover:text-white">Terms</a>
          <a href="#" class="transition hover:text-white">Support</a>
        </div>
        <p class="text-xs text-gray-500">&copy; {{ currentYear }} BrewTokens. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import heroQrCode from '@/assets/images/hero-qr-code.png';
import qrAwardBrewery from '@/assets/images/qr-award-brewery.png';
import qrCode from '@/assets/images/qr-code.png';
import singleQr from '@/assets/images/single-qr.png';

const currentYear = new Date().getFullYear();

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

const signupForm = reactive({
  email: '',
  password: '',
});

const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref(false);

const handleSignup = async () => {
  submitError.value = '';
  submitSuccess.value = false;

  const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;

  if (!signupForm.email || !signupForm.password) {
    submitError.value = 'Please provide both your business email and a password.';
    return;
  }

  if (!emailPattern.test(signupForm.email)) {
    submitError.value = 'Enter a valid business email address so we can connect with you.';
    return;
  }

  if (signupForm.password.length < 8) {
    submitError.value = 'Passwords must be at least 8 characters long.';
    return;
  }

  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 900));
    submitSuccess.value = true;
    signupForm.email = '';
    signupForm.password = '';
  } catch (error) {
    submitError.value = 'Something went wrong while submitting the form. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>