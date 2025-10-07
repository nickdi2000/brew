<template>
  <div
    ref="cardRef"
    :class="cardClasses"
  >
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm font-medium text-indigo-200">
        <Icon icon="mdi:account-plus" class="h-5 w-5" />
        <span>Get started today</span>
      </div>
    </header>

    <div class="mt-6 space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-white">Create your account</h2>
        <p class="mt-2 text-sm text-gray-400">
          Jump into the BrewTokens platform with a guided setup for your team.
        </p>
      </div>

      <ul class="space-y-3 text-sm text-gray-300">
        <li class="flex items-start gap-2">
          <Icon icon="mdi:check" class="mt-1 h-4 w-4 text-emerald-400" />
          <span>Launch a branded loyalty experience in minutes.</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="mdi:check" class="mt-1 h-4 w-4 text-emerald-400" />
          <span>Invite your staff and manage rewards from a single dashboard.</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="mdi:check" class="mt-1 h-4 w-4 text-emerald-400" />
          <span>Offer guests instant sign-ups and frictionless redemptions.</span>
        </li>
      </ul>

      <button
        class="btn btn-primary w-full py-3 text-base font-semibold"
        type="button"
        @click="openRegistration"
      >
        Register your venue
      </button>

      <button
        class="btn btn-secondary w-full py-3 text-base font-semibold"
        type="button"
        @click="openLogin"
      >
        Already have an account? Log in
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  highlight: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['login-request', 'focus-card']);

const router = useRouter();

const cardRef = ref(null);

const cardClasses = computed(() => {
  const classes = [
    'landing-registration-card bg-gray-900/80 border border-white/10 rounded-3xl p-8 text-gray-100 shadow-2xl backdrop-blur transition-shadow duration-300',
  ];

  if (props.highlight) {
    classes.push('ring-4 ring-indigo-400/70 shadow-indigo-500/30 is-highlighted');
  }

  return classes.join(' ');
});

const openRegistration = () => {
  emit('focus-card');
  router
    .push({
      name: 'admin-login',
      query: { tab: 'register' },
    })
    .catch(() => {});
};

const openLogin = () => {
  emit('login-request');
  router
    .push({ name: 'admin-login' })
    .catch(() => {});
};

defineExpose({
  getCardEl: () => cardRef.value,
});
</script>

