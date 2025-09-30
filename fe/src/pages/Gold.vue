<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="relative">
          <!-- Spinning gold coin -->
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500 mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <Icon icon="mdi:gold" class="h-8 w-8 text-amber-600 animate-pulse" />
          </div>
        </div>
        <p class="mt-6 text-lg font-medium text-amber-700 animate-pulse">{{ loadingMessage }}</p>
        <div class="mt-2 flex justify-center space-x-1">
          <div class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
          <div class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>

    <!-- Invalid/Missing Code State -->
    <div v-else-if="showInvalidCode" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <div class="mx-auto mb-6">
          <Icon icon="mdi:alert-circle" class="h-20 w-20 text-red-500 mx-auto" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Invalid or Missing Code</h1>
        <p class="text-lg text-gray-600 mb-6">
          The QR code you're looking for couldn't be found or is invalid.
        </p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-red-700">
            <Icon icon="mdi:information" class="inline h-4 w-4 mr-1" />
            You'll be redirected to the homepage in {{ redirectCountdown }} seconds...
          </p>
        </div>
        <button 
          @click="redirectToHome"
          class="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Go to Homepage Now
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <div class="mx-auto mb-6">
          <Icon icon="mdi:wifi-off" class="h-20 w-20 text-red-500 mx-auto" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p class="text-lg text-gray-600 mb-6">
          We encountered an error while processing your request.
        </p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-red-700 font-medium">Error Details:</p>
          <p class="text-sm text-red-600 mt-1">{{ errorMessage }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            @click="retryLookup"
            class="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            :disabled="loading"
          >
            <Icon icon="mdi:refresh" class="inline h-4 w-4 mr-2" />
            Try Again
          </button>
          <button 
            @click="redirectToHome"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>

    <!-- Success State (brief display before redirect) -->
    <div v-else-if="successRedirect" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <div class="mx-auto mb-6">
          <Icon icon="mdi:check-circle" class="h-20 w-20 text-green-500 mx-auto animate-bounce" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Gold Code Found!</h1>
        <p class="text-lg text-gray-600 mb-4">
          Redirecting you to <strong>{{ organizationName }}</strong>...
        </p>
        <div class="animate-pulse">
          <div class="h-2 bg-amber-200 rounded-full">
            <div class="h-2 bg-amber-500 rounded-full" :style="{ width: redirectProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { qrCodesApi } from '@/api/qrCodes';

const router = useRouter();
const route = useRoute();

// Reactive state
const loading = ref(false);
const loadingMessage = ref('Validating gold code...');
const showInvalidCode = ref(false);
const error = ref(false);
const errorMessage = ref('');
const successRedirect = ref(false);
const organizationName = ref('');
const redirectCountdown = ref(3);
const redirectProgress = ref(0);

// Timer references
let countdownTimer = null;
let progressTimer = null;
let redirectTimer = null;

/**
 * Validates the QR code parameter from the URL
 */
const validateCodeParameter = () => {
  const code = route.query.code;
  
  // Check if code exists and has a value
  if (!code || typeof code !== 'string' || code.trim() === '') {
    console.warn('❌ Gold route accessed without valid code parameter:', { 
      code, 
      query: route.query 
    });
    return null;
  }
  
  // Basic validation - ensure it's not just whitespace
  const trimmedCode = code.trim();
  if (trimmedCode.length === 0) {
    console.warn('❌ Gold route accessed with empty code parameter');
    return null;
  }
  
  console.log('✅ Valid code parameter found:', trimmedCode);
  return trimmedCode;
};

/**
 * Starts the countdown for redirect to homepage
 */
const startInvalidCodeCountdown = () => {
  showInvalidCode.value = true;
  redirectCountdown.value = 3;
  
  countdownTimer = setInterval(() => {
    redirectCountdown.value--;
    if (redirectCountdown.value <= 0) {
      clearInterval(countdownTimer);
      redirectToHome();
    }
  }, 1000);
};

/**
 * Performs the QR code lookup
 */
const performQRCodeLookup = async (code) => {
  try {
    loading.value = true;
    loadingMessage.value = 'Looking up gold code...';
    
    console.log('🔍 Looking up QR code:', code);
    
    // Call the API to lookup the QR code
    const result = await qrCodesApi.lookupQRCode(code);
    
    console.log('✅ QR code lookup successful:', {
      hasQRCode: !!result.qrCode,
      hasOrganization: !!result.organization,
      organizationCode: result.organization?.code,
      organizationName: result.organization?.name
    });
    
    if (!result.qrCode || !result.organization) {
      throw new Error('Invalid response: missing QR code or organization data');
    }
    
    // Store organization name for display
    organizationName.value = result.organization.name || 'Unknown Brewery';
    
    // Show success state briefly before redirecting
    loading.value = false;
    successRedirect.value = true;
    
    // Start progress animation
    let progress = 0;
    progressTimer = setInterval(() => {
      progress += 2;
      redirectProgress.value = Math.min(progress, 100);
      
      if (progress >= 100) {
        clearInterval(progressTimer);
      }
    }, 30);
    
    // Redirect to members route after brief delay
    redirectTimer = setTimeout(() => {
      const targetRoute = `/members/${result.organization.code}`;
      console.log('🚀 Redirecting to:', targetRoute);
      router.push(targetRoute);
    }, 1500);
    
  } catch (err) {
    loading.value = false;
    
    console.error('❌ QR code lookup failed:', {
      error: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    
    // Handle different error types
    if (err.response?.status === 404) {
      // QR code not found - redirect to organization onboarding
      console.log('🏢 QR code not found, redirecting to organization onboarding');
      router.push({ name: 'org-onboarding', query: { code } });
      return;
    } else if (err.response?.status >= 500) {
      // Server error
      error.value = true;
      errorMessage.value = 'Server error occurred. Please try again later.';
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      // Timeout error
      error.value = true;
      errorMessage.value = 'Request timed out. Please check your connection and try again.';
    } else {
      // Generic error
      error.value = true;
      errorMessage.value = err.response?.data?.message || err.message || 'An unexpected error occurred';
    }
  }
};

/**
 * Retries the QR code lookup
 */
const retryLookup = () => {
  error.value = false;
  errorMessage.value = '';
  
  const code = validateCodeParameter();
  if (code) {
    performQRCodeLookup(code);
  } else {
    startInvalidCodeCountdown();
  }
};

/**
 * Redirects to homepage
 */
const redirectToHome = () => {
  console.log('🏠 Redirecting to homepage');
  window.location.href = 'https://brewtokens.com';
};

/**
 * Main initialization function
 */
const initializeGoldRoute = () => {
  console.log('🥇 Initializing Gold route with query:', route.query);
  
  // Validate the code parameter
  const code = validateCodeParameter();
  
  if (!code) {
    // No valid code provided, show invalid state
    startInvalidCodeCountdown();
    return;
  }
  
  // Valid code found, proceed with lookup
  performQRCodeLookup(code);
};

/**
 * Cleanup function
 */
const cleanup = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  initializeGoldRoute();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
/* Custom animations for gold theme */
@keyframes goldShimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.gold-shimmer {
  background: linear-gradient(
    90deg,
    #f59e0b 0%,
    #fbbf24 50%,
    #f59e0b 100%
  );
  background-size: 200px 100%;
  animation: goldShimmer 1.5s infinite;
}

/* Enhanced bounce animation */
@keyframes bounceGold {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-bounce-gold {
  animation: bounceGold 2s infinite;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>