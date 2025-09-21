<template>
  <div class="space-y-6 animate-slide-up">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gradient-blue font-display">QR Code Management</h2>
      <span class="text-sm text-gray-500 font-accent">Last generated: {{ new Date().toLocaleDateString() }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- QR Code Display -->
      <div class="glass-clean rounded-lg p-8 animate-slide-right" style="animation-delay: 100ms">
        <h3 class="text-lg font-semibold text-gradient-blue font-display mb-6">Your QR Code</h3>
        <div class="flex flex-col items-center space-y-6">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl transition-all duration-300 group-hover:blur-2xl"></div>
            <div class="relative w-64 h-64 glass-clean hover-lift rounded-lg p-4 flex items-center justify-center">
              <img src="/images/qr-code.png" alt="QR Code" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="flex space-x-3">
            <button class="btn btn-primary btn-shimmer font-accent">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </button>
            <button class="btn btn-secondary hover-lift font-accent">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print QR Code
            </button>
          </div>
        </div>
      </div>

      <!-- QR Code Settings -->
      <div class="glass-clean rounded-lg p-8 animate-slide-left" style="animation-delay: 200ms">
        <h3 class="text-lg font-semibold text-gradient-blue font-display mb-6">QR Code Settings</h3>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 font-accent">QR Code Type</label>
            <select
              v-model="settings.type"
              class="input-glass w-full rounded-lg px-4 py-2.5 font-accent transition-all duration-300"
            >
              <option value="static">Static QR Code</option>
              <option value="dynamic">Dynamic QR Code</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 font-accent">Linked Location</label>
            <select
              v-model="settings.location"
              class="input-glass w-full rounded-lg px-4 py-2.5 font-accent transition-all duration-300"
            >
              <option value="">Select a Location</option>
              <option value="main-entrance">Main Entrance</option>
              <option value="bar-counter">Bar Counter</option>
              <option value="outdoor-seating">Outdoor Seating</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 font-accent">Points Value</label>
            <input
              type="number"
              v-model="settings.points"
              class="input-glass w-full rounded-lg px-4 py-2.5 font-accent transition-all duration-300"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 font-accent">Expiration</label>
            <input
              type="date"
              v-model="settings.expiration"
              class="input-glass w-full rounded-lg px-4 py-2.5 font-accent transition-all duration-300"
            />
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="btn btn-primary btn-shimmer font-accent">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Settings
            </button>
          </div>
        </form>
      </div>

      <!-- QR Code Analytics -->
      <div class="glass-clean rounded-lg p-8 md:col-span-2 animate-slide-up" style="animation-delay: 300ms">
        <h3 class="text-lg font-semibold text-gradient-blue font-display mb-6">QR Code Analytics</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="(stat, index) in analytics" 
            :key="stat.title"
            class="glass-clean hover-lift rounded-lg p-6 animate-slide-up"
            :style="{ animationDelay: (index * 100 + 400) + 'ms' }"
          >
            <h4 class="text-sm font-medium text-gray-500 font-accent">{{ stat.title }}</h4>
            <p class="mt-2 text-3xl font-semibold text-gradient-blue font-display">{{ stat.value }}</p>
            <p class="mt-1 text-sm text-green-600 font-accent">{{ stat.change }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  type: 'dynamic',
  location: 'bar-counter',
  points: 150,
  expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
})

const analytics = ref({
  totalScans: {
    title: 'Total Scans',
    value: '1,234',
    change: '+12.5% from last week'
  },
  uniqueUsers: {
    title: 'Unique Users',
    value: '856',
    change: '+8.2% from last week'
  },
  pointsAwarded: {
    title: 'Points Awarded',
    value: '12,450',
    change: '+15.3% from last week'
  }
})

const handleSubmit = async () => {
  try {
    // TODO: Implement QR code settings update logic
    console.log('Settings updated:', settings.value)
  } catch (error) {
    console.error('Error updating QR code settings:', error)
  }
}
</script>