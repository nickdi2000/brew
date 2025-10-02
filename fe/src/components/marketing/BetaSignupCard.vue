<template>
  <div
    ref="cardRef"
    :class="cardClasses"
    :style="cardStyle"
  >
    <button
      v-if="isModal"
      class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
      type="button"
      @click="emit('close')"
    >
      <Icon icon="mdi:close" class="h-4 w-4" />
      <span class="sr-only">Close beta request form</span>
    </button>

    <header class="flex items-center justify-between">
      <div class="flex items-center space-x-2 text-sm font-medium text-indigo-200">
        <Icon icon="mdi:account-plus" class="h-5 w-5" />
        <span>Request early access</span>
      </div>
      <span v-if="isSubmitting" class="flex items-center space-x-2 text-xs font-medium text-indigo-200">
        <Icon icon="mdi:loading" class="h-4 w-4 animate-spin" />
        <span>Sending</span>
      </span>
    </header>

    <div class="mt-6">
      <h2 class="text-2xl font-bold text-white">Join the BrewTokens beta</h2>
      <p class="mt-2 text-sm text-gray-400">Tell us how to reach you and we will schedule a guided walkthrough within 24 hours.</p>
    </div>

    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <form
        v-if="!submitSuccess"
        class="mt-8 space-y-6"
        novalidate
        aria-label="Request beta access"
        @submit.prevent="handleSignup"
      >
        <div>
          <label for="beta-request-email" class="block text-sm font-medium text-gray-200">Business email</label>
          <input
            id="beta-request-email"
            ref="emailInputRef"
            v-model="email"
            autocomplete="email"
            class="mt-2 w-full rounded-xl border border-white/10 bg-gray-900/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            :disabled="isSubmitting"
            name="email"
            placeholder="you@brewery.com"
            required
            type="email"
          />
        </div>

        <div class="space-y-3" aria-live="polite">
          <p v-if="submitError" class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{{ submitError }}</p>
        </div>

        <button
          class="btn btn-primary flex w-full items-center justify-center gap-2 py-3 text-base font-semibold transition"
          type="submit"
          :class="{ 'cursor-not-allowed opacity-70': isSubmitting }"
          :disabled="isSubmitting"
        >
          <Icon v-if="isSubmitting" icon="mdi:loading" class="h-5 w-5 animate-spin" />
          <span>{{ isSubmitting ? 'Submitting...' : 'Request an invite' }}</span>
        </button>

        <p class="text-xs text-gray-500">
          By submitting, you agree to our
          <a href="/terms-of-service" class="text-indigo-300 underline-offset-2 hover:underline">Terms</a>
          and
          <a href="/privacy-policy" class="text-indigo-300 underline-offset-2 hover:underline">Privacy Policy</a>.
        </p>
      </form>
    </transition>

    <transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="submitSuccess"
        class="mt-10 space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
          <Icon icon="mdi:check" class="h-7 w-7 text-emerald-300" />
        </div>
        <h3 class="text-xl font-semibold text-white">You're on the list!</h3>
        <p class="text-sm text-emerald-100">We are brewing something special for you. Expect a welcome email within the day.</p>
        <button class="btn btn-secondary" type="button" @click="resetForm" :disabled="isSubmitting">
          Add another email
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { signupForBeta } from '@/api';
import { useToast } from '@/plugins/toast';

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false,
  },
  highlight: {
    type: Boolean,
    default: false,
  },
  cardStyle: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

const toast = useToast();

const cardRef = ref(null);
const emailInputRef = ref(null);

const email = ref('');
const isSubmitting = ref(false);
const submitError = ref('');
const submitSuccess = ref(false);

const cardClasses = computed(() => {
  const classes = [
    'relative rounded-3xl border border-white/10 bg-gray-950/70 p-8 shadow-2xl backdrop-blur transition-shadow duration-300',
    'beta-signup-card',
  ];

  if (props.highlight) {
    classes.push('ring-4 ring-indigo-400/70 shadow-indigo-500/30', 'is-highlighted');
  }

  if (props.isModal) {
    classes.push('max-h-[min(85vh,40rem)] w-full max-w-[34rem] overflow-y-auto');
  }

  return classes.join(' ').trim();
});

const cardStyle = computed(() => ({
  ...props.cardStyle,
}));

const focusEmailInput = async () => {
  await nextTick();
  emailInputRef.value?.focus({ preventScroll: true });
};

watch(
  () => props.isModal,
  async (value) => {
    if (value) {
      await focusEmailInput();
    }
  },
);

const handleSignup = async () => {
  submitError.value = '';
  submitSuccess.value = false;

  const trimmedEmail = email.value.trim();
  const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;

  if (!trimmedEmail) {
    submitError.value = 'Please provide your business email so we can reach you.';
    return;
  }

  if (!emailPattern.test(trimmedEmail)) {
    submitError.value = 'Enter a valid email address so we can connect with you.';
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await signupForBeta(trimmedEmail);

    if (response.data?.success) {
      submitSuccess.value = true;
      toast(response.data.message || 'You are on the list!', 'success');
      email.value = '';
    } else {
      submitError.value = response.data?.message || 'Something went wrong. Please try again.';
      toast(submitError.value, 'error');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong while submitting the form. Please try again.';
    submitError.value = message;
    toast(message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  email.value = '';
  submitError.value = '';
  submitSuccess.value = false;
  focusEmailInput();
};

defineExpose({
  getCardEl: () => cardRef.value,
  focusEmailInput,
});
</script>

