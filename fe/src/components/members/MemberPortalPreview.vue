<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Top Nav -->
    <nav class="bg-gray-900 text-white border-b border-gray-800">
      <div class="px-4 py-3 flex items-center justify-between">
        <!-- Left: Menu Button -->
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-300"
          aria-label="Menu"
        >
          <Icon icon="mdi:menu" class="h-6 w-6" />
        </button>

        <!-- Center: User & Points -->
        <div class="flex items-center space-x-3">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
            J
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-white">
              John Smith
            </span>
          </div>
        </div>
        
        <!-- Right: Points Badge -->
        <div class="flex items-center relative">
          <div class="bg-amber-500/20 rounded-full px-3 py-1 flex items-center">
            <Icon icon="mdi:star" class="h-4 w-4 text-amber-400 mr-1" />
            <span class="text-sm font-medium text-amber-300">
              250
            </span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow overflow-y-auto bg-gray-50">
      <!-- Hero Section -->
      <div 
        class="relative h-48 flex items-center justify-center bg-cover bg-center"
        :style="{
          backgroundImage: `url(${bannerImage || '/images/brewery-beers-coins.png'})`
        }"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
        
        <!-- Content -->
        <div class="relative z-10 text-center px-6">
          <h1 class="text-2xl font-bold text-white mb-2">
            {{ name || 'Welcome' }}
          </h1>
          <p class="text-sm text-white text-opacity-90">
            Member since {{ memberSince }}
          </p>
        </div>
      </div>

      <!-- Points Card -->
      <div class="px-4 -mt-8 mb-6">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-2">Your Points Balance</p>
            <p class="text-4xl font-bold text-gray-900 mb-1">250</p>
            <p class="text-xs text-gray-500">Keep earning to unlock rewards!</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="px-4 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-3">
              <Icon icon="mdi:qrcode" class="h-6 w-6 text-amber-600" />
            </div>
            <p class="text-sm font-medium text-gray-900">Scan QR</p>
            <p class="text-xs text-gray-500 mt-1">Earn points</p>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
              <Icon icon="mdi:gift" class="h-6 w-6 text-blue-600" />
            </div>
            <p class="text-sm font-medium text-gray-900">Rewards</p>
            <p class="text-xs text-gray-500 mt-1">View available</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="px-4 pb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Icon icon="mdi:plus" class="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Welcome Bonus</p>
                <p class="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-green-600">+250</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 w-full">
      <div class="py-4 px-6">
        <div class="pt-3 border-t border-gray-800">
          <a 
            href="https://brewtokens.com" 
            target="_blank" 
            class="flex items-center justify-center text-xs text-gray-500 group"
          >
            <span>Powered by</span>&nbsp;
            <strong>BrewTokens</strong>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: ''
  }
});

const memberSince = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
});
</script>

<style scoped>
/* Any additional styles */
</style>

