<template>
  <div class="p-8 space-y-8">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Members Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-slide-up" style="animation-delay: 0ms">
        <div class="flex items-center justify-between">
          <h3 class="text-gray-500 text-sm font-medium">Total Members</h3>
          <div class="p-2 bg-blue-50 rounded-full">
            <Icon icon="mdi:account-group" class="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <p class="mt-3 text-3xl font-semibold text-gray-900">0</p>
        <p class="mt-2 text-sm text-gray-500">Active members in your program</p>
      </div>

      <!-- Total Rewards Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-slide-up" style="animation-delay: 100ms">
        <div class="flex items-center justify-between">
          <h3 class="text-gray-500 text-sm font-medium">Active Rewards</h3>
          <div class="p-2 bg-purple-50 rounded-full">
            <Icon icon="mdi:gift" class="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <p class="mt-3 text-3xl font-semibold text-gray-900">0</p>
        <p class="mt-2 text-sm text-gray-500">Available reward options</p>
      </div>

      <!-- Total Points Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-slide-up" style="animation-delay: 200ms">
        <div class="flex items-center justify-between">
          <h3 class="text-gray-500 text-sm font-medium">Points Issued</h3>
          <div class="p-2 bg-amber-50 rounded-full">
            <Icon icon="mdi:beer" class="h-6 w-6 text-amber-500" />
          </div>
        </div>
        <p class="mt-3 text-3xl font-semibold text-gray-900">0</p>
        <p class="mt-2 text-sm text-gray-500">Total points in circulation</p>
      </div>

      <!-- Redemptions Card -->
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-slide-up" style="animation-delay: 300ms">
        <div class="flex items-center justify-between">
          <h3 class="text-gray-500 text-sm font-medium">Redemptions</h3>
          <div class="p-2 bg-green-50 rounded-full">
            <Icon icon="mdi:ticket-confirmation" class="h-6 w-6 text-green-500" />
          </div>
        </div>
        <p class="mt-3 text-3xl font-semibold text-gray-900">0</p>
        <p class="mt-2 text-sm text-gray-500">Total rewards redeemed</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>

<style>
.animate-fade-slide-up {
  animation: fadeSlideUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeSlideUp {
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