<template>
  <div class="welcome-root">
    <!-- Background layer: banner image + overlay -->
    <div class="welcome-bg">
      <img
        :src="bannerImage || '/images/brewery-beers-coins.png'"
        alt=""
        class="welcome-bg-img"
      />
      <div class="welcome-bg-overlay"></div>
    </div>

    <!-- Radar pulse from top edge -->
    <div class="radar-origin">
      <div class="radar-ring radar-ring--1"></div>
      <div class="radar-ring radar-ring--2"></div>
      <div class="radar-ring radar-ring--3"></div>
    </div>

    <!-- Content -->
    <div class="welcome-content">
      <!-- Top spacer -->
      <div class="welcome-top"></div>

      <!-- Branding -->
      <div class="welcome-brand">
        <h1 class="welcome-title">{{ name || 'Welcome' }}</h1>
        <p v-if="description" class="welcome-desc">{{ description }}</p>
      </div>

      <!-- Actions -->
      <div class="welcome-actions">
        <GoogleLogin
          v-if="!isDemoMode"
          :callback="handleGoogleLoginSuccess"
          :error-callback="handleGoogleLoginError"
          :popup-type="'CODE'"
          :auto-login="false"
          :client-id="googleClientId"
          class="w-full"
          :disabled="isLoading || isAdminOfThisOrg"
        >
          <template #default="{ isProcessing }">
            <button
              type="button"
              class="welcome-signin-btn"
              :class="{ 'opacity-50 pointer-events-none': isLoading || isAdminOfThisOrg }"
              :disabled="isLoading || isAdminOfThisOrg"
            >
              <template v-if="isProcessing">
                <div class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Signing in…</span>
              </template>
              <template v-else>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  class="h-5 w-5 flex-shrink-0"
                />
                <span>{{ isAdminOfThisOrg ? 'Admin cannot join here' : 'Continue with Google' }}</span>
              </template>
            </button>
          </template>
        </GoogleLogin>

        <p v-if="isAdminOfThisOrg" class="mt-2 text-center text-xs text-red-400">
          You're an admin of this organization. Log out to join as a member.
        </p>

        <button
          v-if="isDemoMode"
          type="button"
          class="welcome-demo-btn"
          :class="{ 'opacity-50 pointer-events-none': isLoading || isAdminOfThisOrg || isDemoLoading }"
          :disabled="isLoading || isAdminOfThisOrg || isDemoLoading"
          @click="handleDemoLogin"
        >
          <template v-if="isDemoLoading">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            <span>Signing in…</span>
          </template>
          <template v-else>
            <Icon icon="mdi:flask-outline" class="h-5 w-5" />
            <span>DEMO LOGIN</span>
          </template>
        </button>
      </div>

      <!-- Feature pills -->
      <div class="welcome-features">
        <div
          v-for="feature in features"
          :key="feature.label"
          class="welcome-feature"
          @click="feature.onClick?.()"
        >
          <Icon :icon="feature.icon" class="h-4 w-4 text-amber-400" />
          <span>{{ feature.label }}</span>
        </div>
      </div>

      <!-- Powered by -->
      <p class="welcome-powered">
        Powered by <strong class="text-white/60">BrewTokens</strong>
      </p>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from '@/plugins/toast';
import { GoogleLogin } from 'vue3-google-login';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoading = ref(false);
const isDemoLoading = ref(false);
const googleClientId = ref(import.meta.env.VITE_GOOGLE_CLIENT_ID);
const membershipByCode = ref(null);

const props = defineProps({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  code: { type: String, default: '' },
  isDemoMode: { type: Boolean, default: false },
});

defineEmits(['sign-in']);

const isAdminOfThisOrg = computed(() => {
  return membershipByCode.value?.role === 'admin' || membershipByCode.value?.role === 'owner';
});

const features = computed(() => [
  { label: 'Earn points every visit', icon: 'mdi:star-circle-outline' },
  { label: 'Redeem exclusive rewards', icon: 'mdi:gift-outline' },
  { label: 'Early access to events', icon: 'mdi:bell-outline' },
]);

const resolveMembershipForCode = async () => {
  const codeToUse = props.code || route.params.code;
  membershipByCode.value = null;
  if (!codeToUse) return;

  if (store.getters['auth/token']) {
    router.push({ name: 'member-portal', params: { code: codeToUse } });
    return;
  }

  try {
    const { default: api } = await import('@/api');
    const response = await api.get(`/memberships/by-code/${codeToUse}`);
    membershipByCode.value = response.data.data;
  } catch {
    // Not a member — fine
  }
};

watch(
  () => props.code || route.params.code,
  (newCode, oldCode) => {
    if (newCode && newCode !== oldCode) {
      resolveMembershipForCode();
    }
  }
);

onMounted(() => {
  resolveMembershipForCode();
});

const handleGoogleLoginSuccess = async (response) => {
  const codeToUse = props.code || route.params.code;
  if (!codeToUse) return;

  try {
    isLoading.value = true;
    const authResult = await store.dispatch('auth/handleGoogleLogin', {
      credential: response.code,
      code: codeToUse,
    });

    if (!authResult?.membership) {
      throw new Error('No membership found for this organization');
    }

    router.push({ name: 'member-portal', params: { code: codeToUse } });
  } catch (err) {
    console.error('Google login error:', err);
    toast(err.response?.data?.message || err.message || 'Failed to authenticate with Google', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLoginError = (error) => {
  console.error('Google login error:', error);
  toast('Failed to sign in with Google', 'error');
};

const handleDemoLogin = async () => {
  const codeToUse = props.code || route.params.code;
  if (!codeToUse) {
    toast('Missing organization code for demo login', 'error');
    return;
  }
  if (!props.isDemoMode) {
    toast('Demo login is not enabled for this organization', 'error');
    return;
  }

  try {
    isDemoLoading.value = true;
    const authResult = await store.dispatch('auth/handleDemoLogin', { code: codeToUse });

    if (!authResult?.membership) {
      throw new Error('No membership found for this organization');
    }

    toast('Demo login successful', 'success');
    router.push({ name: 'member-portal', params: { code: codeToUse } });
  } catch (err) {
    console.error('Demo login error:', err);
    toast(err.response?.data?.message || err.message || 'Demo login failed', 'error');
  } finally {
    isDemoLoading.value = false;
  }
};

</script>

<style scoped>
/* ---- Full-screen dark shell ---- */
.welcome-root {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  overflow: hidden;
  background: #000;
}

/* ---- Background image ---- */
.welcome-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.welcome-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.8);
}

.welcome-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.6) 45%,
    rgba(0, 0, 0, 0.88) 100%
  );
}

/* ---- Radar pulse ---- */
.radar-origin {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  pointer-events: none;
}

.radar-ring {
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 2.5px solid rgba(96, 165, 250, 0.7);
  box-shadow: 0 0 18px 4px rgba(96, 165, 250, 0.25);
  animation: radar-expand 4.5s ease-out infinite;
}

.radar-ring--1 { animation-delay: 0s; }
.radar-ring--2 { animation-delay: 1.5s; }
.radar-ring--3 { animation-delay: 3s; }

@keyframes radar-expand {
  0% {
    width: 0;
    height: 0;
    top: 0;
    opacity: 0.85;
    border-color: rgba(96, 165, 250, 0.8);
    box-shadow: 0 0 20px 6px rgba(96, 165, 250, 0.35);
  }
  100% {
    width: 700px;
    height: 700px;
    top: -350px;
    opacity: 0;
    border-color: rgba(96, 165, 250, 0);
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
  }
}

/* ---- Content column ---- */
.welcome-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 0 24px env(safe-area-inset-bottom, 20px);
}

.welcome-top {
  flex: 1.2;
  min-height: 60px;
}

/* ---- Branding ---- */
.welcome-brand {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  line-height: 1.15;
}

.welcome-desc {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

/* ---- Actions ---- */
.welcome-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.welcome-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.welcome-signin-btn:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.16);
}

.welcome-demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b0b0b;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 20px -6px rgba(245, 158, 11, 0.6);
  transition: transform 0.15s, filter 0.2s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.welcome-demo-btn:hover {
  filter: brightness(1.05);
}

.welcome-demo-btn:active {
  transform: scale(0.98);
}

/* ---- Feature pills ---- */
.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;
}

.welcome-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  -webkit-tap-highlight-color: transparent;
}

/* ---- Powered by ---- */
.welcome-powered {
  flex-shrink: 0;
  padding-bottom: 16px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  text-align: center;
}

/* ---- Spacer pushes powered-by to bottom ---- */
.welcome-features {
  flex-shrink: 0;
}

.welcome-actions + .welcome-features {
  margin-top: auto;
}
</style>
