<template>
  <div class="p-6 space-y-6">
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Member Growth -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Member Growth</h3>
          <div class="flex items-center text-sm text-gray-500">
            <Icon icon="mdi:trending-up" class="h-5 w-5 text-green-500 mr-1" />
            <span>This Month</span>
          </div>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon icon="mdi:chart-line" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">No member data available yet</p>
          </div>
        </div>
      </div>

      <!-- Point Distribution -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Point Distribution</h3>
          <div class="flex items-center text-sm text-gray-500">
            <Icon icon="mdi:chart-pie" class="h-5 w-5 text-primary-500 mr-1" />
            <span>All Time</span>
          </div>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon icon="mdi:chart-donut" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">No point distribution data yet</p>
          </div>
        </div>
      </div>

      <!-- Reward Popularity -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Popular Rewards</h3>
          <div class="flex items-center text-sm text-gray-500">
            <Icon icon="mdi:star" class="h-5 w-5 text-yellow-500 mr-1" />
            <span>Top 5</span>
          </div>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon icon="mdi:chart-bar" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">No reward redemption data yet</p>
          </div>
        </div>
      </div>

      <!-- Activity Times -->
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Peak Activity Times</h3>
          <div class="flex items-center text-sm text-gray-500">
            <Icon icon="mdi:clock" class="h-5 w-5 text-blue-500 mr-1" />
            <span>Last 7 Days</span>
          </div>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <Icon icon="mdi:chart-timeline" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p class="text-gray-500">No activity data available yet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="bg-primary-50 rounded-lg p-6">
      <div class="flex items-start">
        <Icon icon="mdi:lightbulb" class="h-6 w-6 text-primary-500 mt-1" />
        <div class="ml-4">
          <h4 class="text-primary-900 font-medium mb-2">Tips for Growing Your Program</h4>
          <ul class="space-y-2 text-primary-700">
            <li class="flex items-center">
              <Icon icon="mdi:check-circle" class="h-5 w-5 text-primary-500 mr-2" />
              Create varied reward tiers to encourage engagement
            </li>
            <li class="flex items-center">
              <Icon icon="mdi:check-circle" class="h-5 w-5 text-primary-500 mr-2" />
              Place QR codes in high-traffic areas
            </li>
            <li class="flex items-center">
              <Icon icon="mdi:check-circle" class="h-5 w-5 text-primary-500 mr-2" />
              Promote special events with bonus points
            </li>
            <li class="flex items-center">
              <Icon icon="mdi:check-circle" class="h-5 w-5 text-primary-500 mr-2" />
              Regularly update your reward offerings
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>