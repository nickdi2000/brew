<template>
  <div class="p-6">
    <!-- Activity Feed -->
    <div class="bg-white rounded-lg shadow border border-gray-100">
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div class="flex space-x-2">
            <button class="btn btn-secondary text-sm">
              <Icon icon="mdi:filter" class="h-4 w-4 mr-1" />
              Filter
            </button>
            <button class="btn btn-secondary text-sm">
              <Icon icon="mdi:download" class="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="p-12 text-center">
        <div class="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Icon icon="mdi:timeline-clock" class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-8">
          Your activity feed will show member interactions, point earnings, and reward redemptions as they happen.
        </p>
        
        <!-- Sample Activities -->
        <div class="max-w-2xl mx-auto bg-gray-50 rounded-lg p-6 text-left">
          <h4 class="text-sm font-medium text-gray-700 mb-4">Here's what you'll see:</h4>
          <div class="space-y-4">
            <div class="flex items-start opacity-50">
              <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Icon icon="mdi:account-plus" class="h-5 w-5 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-900">New Member Joined</p>
                <p class="text-xs text-gray-500">John D. joined your rewards program</p>
              </div>
              <span class="ml-auto text-xs text-gray-400">2 hours ago</span>
            </div>

            <div class="flex items-start opacity-50">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon icon="mdi:beer" class="h-5 w-5 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-900">Points Earned</p>
                <p class="text-xs text-gray-500">Sarah M. earned 50 points</p>
              </div>
              <span class="ml-auto text-xs text-gray-400">5 hours ago</span>
            </div>

            <div class="flex items-start opacity-50">
              <div class="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Icon icon="mdi:gift" class="h-5 w-5 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-900">Reward Redeemed</p>
                <p class="text-xs text-gray-500">Mike R. redeemed "Free Beer"</p>
              </div>
              <span class="ml-auto text-xs text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
</script>