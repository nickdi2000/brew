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
          
          <!-- Sign In Button (Preview - Mock) -->
          <button
            @click="handleMockSignIn"
            :disabled="isSigningIn"
            class="group w-full flex justify-center items-center px-4 py-3 border border-gray-700 rounded-xl text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow-md hover:shadow-xl transition-all duration-200 ease-out relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Subtle shine effect -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            </div>
            <template v-if="isSigningIn">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 z-10 relative"></div>
              <span class="z-10 relative">Signing in with Google...</span>
            </template>
            <template v-else>
              <img src="https://www.google.com/favicon.ico" alt="Google" class="h-5 w-5 mr-3 z-10 relative flex-shrink-0" />
              <span class="z-10 relative">Sign in with Google</span>
              <Icon icon="mdi:arrow-right" class="ml-2 h-5 w-5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-10 relative" />
            </template>
          </button>
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
import { ref } from 'vue';

const isSigningIn = ref(false);

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
  }
});

const emit = defineEmits(['sign-in-complete']);

const handleMockSignIn = () => {
  if (isSigningIn.value) return;
  
  isSigningIn.value = true;
  
  // Simulate Google sign-in process with a delay
  setTimeout(() => {
    isSigningIn.value = false;
    emit('sign-in-complete');
  }, 2000); // 2 second mock sign-in animation
};
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

