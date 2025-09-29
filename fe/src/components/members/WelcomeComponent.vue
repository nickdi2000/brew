<template>
  <div class="h-full flex flex-col">
    <!-- Main Content -->
    <main class="flex-grow flex flex-col">
      <!-- Hero Section -->
      <div 
        class="relative min-h-[360px] flex items-center justify-center bg-cover bg-center"
        :style="{
          backgroundImage: `url(${bannerImage || '/images/brewery-beers-coins.png'})`
        }"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 backdrop-blur-[1px]"></div>
        
        <!-- Content -->
        <div class="relative z-10 w-full mx-auto text-center px-6 pt-12 pb-32">
          <h1 class="text-3xl font-bold text-white mb-3 animate-fade-in">
            {{ name || 'Welcome' }}
          </h1>
          <p class="text-lg text-white text-opacity-90 max-w-sm mx-auto">
            {{ description || 'Loading brewery description...' }}
          </p>
        </div>
      </div>

      <!-- Login Card -->
      <div class="relative -mt-20 px-6">
        <div class="bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Join our rewards program
          </h2>
          
          <!-- Sign In Button -->
          <GoogleLogin
            :callback="handleGoogleLoginSuccess"
            :error-callback="handleGoogleLoginError"
            :popup-type="'CODE'"
            :auto-login="false"
            :client-id="googleClientId"
            class="w-full"
            :disabled="isLoading || isAdminOfThisOrg"
            :class="{
              'opacity-50 cursor-not-allowed': isLoading || isAdminOfThisOrg
            }"
          >
            <template #default="{ isProcessing }">
              <div
                class="group w-full flex justify-center items-center px-4 py-3 border border-gray-700 rounded-xl text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow-md hover:shadow-xl transition-all duration-200 ease-out relative overflow-hidden"
              >
                <!-- Subtle shine effect pseudo-element for epic twist: a sweeping highlight on hover -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </div>
                <template v-if="isProcessing">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 z-10 relative"></div>
                  <span class="z-10 relative">Signing in...</span>
                </template>
                <template v-else>
                  <img src="https://www.google.com/favicon.ico" alt="Google" class="h-5 w-5 mr-3 z-10 relative flex-shrink-0" />
                  <span class="z-10 relative">{{ isAdminOfThisOrg ? 'Admin cannot join as member here' : 'Sign in with Google' }}</span>
                  <Icon icon="mdi:arrow-right" class="ml-2 h-5 w-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-10 relative" />
                </template>
              </div>
            </template>
          </GoogleLogin>
          
          <!-- Demo Login Button (Development Only) -->
          <div v-if="isDevelopment" class="mt-3">
            <button
              @click="handleDemoLogin"
              :disabled="isLoading"
              class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:test-tube" class="h-4 w-4 mr-2" />
              Demo Login
            </button>
          </div>
          
          <p v-if="isAdminOfThisOrg" class="text-sm text-red-600 mt-2">You're an admin of this organization. Log out to join as a member.</p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="bg-white px-6 pt-12 pb-8">
        <div class="max-w-sm mx-auto">
          <!-- Feature Cards -->
          <div class="space-y-6">
            <!-- Feature 1 -->
            <div class="bg-sky-50 rounded-xl p-4 flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="bg-sky-100 rounded-lg p-2">
                  <Icon icon="mdi:gift" class="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Earn Points</h3>
                <p class="text-sm text-gray-600 mt-0.5">Get rewarded for every visit</p>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="bg-sky-50 rounded-xl p-4 flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="bg-sky-100 rounded-lg p-2">
                  <Icon icon="mdi:star" class="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Exclusive Perks</h3>
                <p class="text-sm text-gray-600 mt-0.5">Free drinks & special offers</p>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="bg-sky-50 rounded-xl p-4 flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="bg-sky-100 rounded-lg p-2">
                  <Icon icon="mdi:bell" class="h-6 w-6 text-sky-600" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Early Access</h3>
                <p class="text-sm text-gray-600 mt-0.5">Be first to know about events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from '@/plugins/toast';
import { GoogleLogin } from 'vue3-google-login';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const currentUser = computed(() => store.getters.currentUser);
const isLoading = ref(false);
const googleClientId = ref(import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Environment detection
const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV || 
         window.location.hostname === 'localhost' ||
         window.location.hostname.includes('.local');
});

// Determine if the logged-in user is an admin of this organization
const isAdminOfThisOrg = computed(() => {
  const user = store.getters.currentUser;
  const memberships = user?.memberships || [];
  if (!props.code && !route.params.code) return false;
  // We need to know if user has admin membership for this org code.
  // Frontend does not have org id here, so fetch membership by code when mounted.
  return membershipByCode.value?.role === 'admin' || membershipByCode.value?.role === 'owner';
});

const membershipByCode = ref(null);

onMounted(async () => {
  const codeToUse = props.code || route.params.code;
  if (!codeToUse) return;

  // If user is already logged in, redirect to member portal
  if (store.getters.token) {
    router.push({ name: 'member-portal', params: { code: codeToUse } });
    return;
  }

  try {
    // Only check membership for admins to show the warning message
    const { default: api } = await import('@/api');
    const response = await api.get(`/memberships/by-code/${codeToUse}`);
    membershipByCode.value = response.data.data;
  } catch (error) {
    // Silently ignore if not a member
  }
});

// Handle Google login success
const handleGoogleLoginSuccess = async (response) => {
  const codeToUse = props.code || route.params.code;
  if (!codeToUse) {
    console.error('❌ Organization code not available');
    return;
  }

  try {
    isLoading.value = true;
    await store.dispatch('auth/handleGoogleLogin', {
      credential: response.code,
      // Our auth module expects organizationId param, which the API layer maps
      organizationId: codeToUse
    });
    
    // Navigate to the authenticated member portal
    router.push({ name: 'member-portal', params: { code: codeToUse } });
  } catch (error) {
    console.error('❌ Google login error:', error);
    toast(error.response?.data?.message || error.message || 'Failed to authenticate with Google', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Handle Google login error
const handleGoogleLoginError = (error) => {
  console.error('❌ Google login error:', error);
  toast('Failed to sign in with Google', 'error');
};

// Handle demo login
const handleDemoLogin = async () => {
  const codeToUse = props.code || route.params.code;
  if (!codeToUse) {
    console.error('❌ Organization code not available');
    toast('Organization code not available', 'error');
    return;
  }

  try {
    isLoading.value = true;
    console.log('🧪 Demo login started');
    
    // Use the dedicated demo login action
    await store.dispatch('auth/handleDemoLogin', {
      organizationId: codeToUse
    });
    
    console.log('🧪 Demo login successful');
    toast('Demo login successful!', 'success');
    
    // Navigate to the authenticated member portal
    router.push({ name: 'member-portal', params: { code: codeToUse } });
  } catch (error) {
    console.error('❌ Demo login error:', error);
    toast(error.response?.data?.message || error.message || 'Demo login failed', 'error');
  } finally {
    isLoading.value = false;
  }
};

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    default: ''
  }
});


defineEmits(['sign-in']);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
