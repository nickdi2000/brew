<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <section class="relative overflow-hidden pb-24 pt-24">
      <div class="absolute inset-0">
        <img :src="heroQrCode" alt="BrewTokens venue backdrop" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-950/85 to-indigo-900/65"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header class="flex items-center justify-between text-sm text-indigo-200">
          <router-link to="/" class="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 font-medium transition hover:border-indigo-400/50 hover:bg-indigo-400/10">
            <Icon icon="mdi:arrow-left" class="h-4 w-4 transition group-hover:-translate-x-1" />
            <span>Back to home</span>
          </router-link>
          <div class="hidden items-center gap-2 text-xs sm:flex">
            <Icon icon="mdi:clock-outline" class="h-4 w-4" />
            <span>We reply within one business day</span>
          </div>
        </header>

        <div class="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside class="space-y-8 rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur lg:col-span-5">
            <div class="space-y-3">
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                <Icon icon="mdi:email-newsletter" class="h-4 w-4" />
                <span>Contact BrewTokens</span>
              </span>
              <h1 class="text-3xl font-bold text-white sm:text-4xl">Let's collaborate</h1>
              <p class="text-sm text-gray-300 sm:text-base">
                Whether you have questions about launch timelines, custom branding, or integrations, we are here to help. Drop us a note and our team will reach out shortly.
              </p>
            </div>

            <dl class="space-y-4">
              <div v-for="highlight in highlights" :key="highlight.title" class="flex items-start gap-4 rounded-2xl border border-white/10 bg-gray-950/40 p-4">
                <div class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20">
                  <Icon :icon="highlight.icon" class="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <dt class="text-sm font-semibold text-white">{{ highlight.title }}</dt>
                  <dd class="mt-1 text-sm text-gray-300">{{ highlight.copy }}</dd>
                </div>
              </div>
            </dl>
          </aside>

          <div class="lg:col-span-7">
            <div class="rounded-3xl border border-white/10 bg-gray-950/80 p-8 shadow-2xl backdrop-blur">
              <header class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-medium text-indigo-200">
                  <Icon icon="mdi:message-plus" class="h-5 w-5" />
                  <span>Send us a note</span>
                </div>
                <span v-if="isSubmitting" class="flex items-center gap-2 text-xs font-medium text-indigo-200">
                  <Icon icon="mdi:loading" class="h-4 w-4 animate-spin" />
                  <span>Sending</span>
                </span>
              </header>

              <p class="mt-4 text-sm text-gray-400">
                Fill out the form and we will connect within one business day. If you prefer, email us directly at
                <a href="mailto:hello@brewtokens.com" class="text-indigo-300 underline-offset-2 hover:underline">hello@brewtokens.com</a>.
              </p>

              <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <form
                  v-if="!submitSuccess"
                  @submit.prevent="handleSubmit"
                  class="mt-8 space-y-6"
                  aria-label="Contact BrewTokens"
                  novalidate
                >
                  <div>
                    <label for="contact-email" class="block text-sm font-medium text-gray-200">Email</label>
                    <input
                      id="contact-email"
                      v-model="email"
                      type="email"
                      name="email"
                      autocomplete="email"
                      placeholder="you@brewery.com"
                      class="mt-2 w-full rounded-xl border border-white/10 bg-gray-900/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      :disabled="isSubmitting"
                      required
                    />
                  </div>

                  <div>
                    <label for="contact-message" class="block text-sm font-medium text-gray-200">Comments</label>
                    <textarea
                      id="contact-message"
                      v-model="comments"
                      name="message"
                      rows="6"
                      placeholder="Share how we can help your venue"
                      class="mt-2 w-full rounded-xl border border-white/10 bg-gray-900/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                      :disabled="isSubmitting"
                      required
                    ></textarea>
                  </div>

                  <div class="space-y-3" aria-live="polite">
                    <p v-if="submitError" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{{ submitError }}</p>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary flex w-full items-center justify-center gap-2 py-3 text-base font-semibold"
                    :disabled="isSubmitting"
                    :class="{ 'cursor-not-allowed opacity-70': isSubmitting }"
                  >
                    <Icon v-if="isSubmitting" icon="mdi:loading" class="h-5 w-5 animate-spin" />
                    <span>{{ isSubmitting ? 'Sending...' : 'Submit message' }}</span>
                  </button>
                </form>
              </transition>

              <transition
                enter-active-class="transition duration-500 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div
                  v-if="submitSuccess"
                  class="mt-10 space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center"
                >
                  <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                    <Icon icon="mdi:check" class="h-7 w-7 text-emerald-300" />
                  </div>
                  <h2 class="text-xl font-semibold text-white">We received your message</h2>
                  <p class="text-sm text-emerald-100">Thanks for reaching out. A BrewTokens team member will reply soon.</p>
                  <button class="btn btn-secondary" type="button" @click="resetForm" :disabled="isSubmitting">
                    Send another message
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import heroQrCode from '@/assets/images/hero-qr-code.png';
import { submitContactRequest } from '@/api';
import { useToast } from '@/plugins/toast';

const toast = useToast();

const highlights = [
  {
    title: 'Talk with our founders',
    copy: 'Share your goals and we will tailor a BrewTokens walkthrough to your taproom.',
    icon: 'mdi:account-voice',
  },
  {
    title: 'Launch support',
    copy: 'Get help with onboarding, staff training, and crafting irresistible reward campaigns.',
    icon: 'mdi:rocket-launch-outline',
  },
  {
    title: 'Partner ecosystem',
    copy: 'Explore integrations with TriviaRat, POS systems, and marketing tools you already use.',
    icon: 'mdi:link-variant',
  },
];

const email = ref('');
const comments = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref(false);

const handleSubmit = async () => {
  submitError.value = '';
  submitSuccess.value = false;

  const trimmedEmail = email.value.trim();
  const trimmedMessage = comments.value.trim();
  const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;

  if (!trimmedEmail) {
    submitError.value = 'Please enter your email so we can respond.';
    return;
  }

  if (!emailPattern.test(trimmedEmail)) {
    submitError.value = 'Enter a valid email address so we can connect with you.';
    return;
  }

  if (!trimmedMessage) {
    submitError.value = 'Let us know how we can help in the comments field.';
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await submitContactRequest({ email: trimmedEmail, message: trimmedMessage });

    if (response.data?.success) {
      submitSuccess.value = true;
      toast(response.data.message || 'Thanks for getting in touch!', 'success');
      email.value = '';
      comments.value = '';
    } else {
      submitError.value = response.data?.message || 'Something went wrong. Please try again.';
      toast(submitError.value, 'error');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Something went wrong while submitting the form. Please try again.';
    submitError.value = errorMessage;
    toast(errorMessage, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  email.value = '';
  comments.value = '';
  submitError.value = '';
  submitSuccess.value = false;
};
</script>

