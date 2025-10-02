<template>
  <div class="relative">
    <div class="p-6 space-y-8 min-h-xl">
      <section>
        <header class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">Analytics</h2>
            <p class="text-sm text-gray-500">High-level insights for the last 30 days</p>
          </div>
          <button class="btn btn-secondary text-sm opacity-50 cursor-not-allowed">
            <Icon icon="mdi:calendar" class="h-4 w-4 mr-2" />
            Change Date Range
          </button>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div
            v-for="metric in keyMetrics"
            :key="metric.title"
            class="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-500 mb-1">{{ metric.title }}</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ metric.value }}</h3>
              </div>
              <div
                :class="[
                  'text-sm font-medium flex items-center gap-1',
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                ]"
              >
                <Icon :icon="metric.trend === 'up' ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="h-4 w-4" />
                {{ metric.percentage }}%
              </div>
            </div>
            <div class="mt-2">
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :style="{ width: metric.percentage + '%' }"
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                  ]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
          <div class="h-64 flex items-end justify-between gap-2">
            <div v-for="bar in memberGrowth" :key="bar.month" class="flex-1">
              <div
                :style="{ height: bar.height + '%' }"
                class="bg-blue-500 rounded-t-md transform origin-bottom animate-grow"
              ></div>
              <div class="text-xs text-gray-500 mt-2 text-center">{{ bar.month }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Points Distribution</h3>
          <div class="flex items-center justify-center h-64">
            <div class="relative w-48 h-48">
              <svg viewBox="0 0 100 100" class="transform -rotate-90">
                <circle
                  v-for="(segment, index) in pointsDistribution"
                  :key="segment.label"
                  :stroke-dasharray="`${segment.percentage} 100`"
                  :stroke-dashoffset="-index * segment.percentage"
                  :stroke="segment.color"
                  stroke-width="32"
                  fill="none"
                  r="16"
                  cx="50"
                  cy="50"
                  class="transition-all duration-[2000ms] animate-pie-grow"
                />
              </svg>
            </div>
            <div class="ml-8">
              <div
                v-for="segment in pointsDistribution"
                :key="segment.label"
                class="flex items-center gap-2 mb-2"
              >
                <div :style="{ backgroundColor: segment.color }" class="w-3 h-3 rounded-full"></div>
                <span class="text-sm text-gray-600">{{ segment.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto space-y-4">
        <Icon icon="mdi:chart-line" class="h-12 w-12 text-blue-500 mx-auto" />
        <h2 class="text-2xl font-semibold text-gray-900">Advanced Analytics Coming Soon</h2>
        <p class="text-gray-600 text-sm">
          We’re polishing real-time insights for your loyalty program. You’ll see engagement trends and member activity here shortly.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const keyMetrics = ref([
  { title: 'Total Members', value: '2,847', trend: 'up', percentage: 12 },
  { title: 'Active Members', value: '1,923', trend: 'up', percentage: 8 },
  { title: 'Points Awarded', value: '45,231', trend: 'up', percentage: 15 },
  { title: 'Redemption Rate', value: '68%', trend: 'down', percentage: 5 }
])

const memberGrowth = ref([
  { month: 'Jan', height: 45 },
  { month: 'Feb', height: 52 },
  { month: 'Mar', height: 58 },
  { month: 'Apr', height: 65 },
  { month: 'May', height: 72 },
  { month: 'Jun', height: 80 },
  { month: 'Jul', height: 85 }
])

const pointsDistribution = ref([
  { label: 'Check-ins', percentage: 35, color: '#3B82F6' },
  { label: 'Purchases', percentage: 25, color: '#10B981' },
  { label: 'Referrals', percentage: 20, color: '#6366F1' },
  { label: 'Events', percentage: 20, color: '#F59E0B' }
])

const recentActivity = ref([
  {
    id: 1,
    member: 'John Smith',
    email: 'john.s@email.com',
    action: 'Redeemed Free Pint',
    points: -100,
    date: '2 mins ago'
  },
  {
    id: 2,
    member: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    action: 'Check-in Bonus',
    points: 50,
    date: '15 mins ago'
  },
  {
    id: 3,
    member: 'Mike Wilson',
    email: 'mike.w@email.com',
    action: 'Purchase Points',
    points: 200,
    date: '1 hour ago'
  }
])
</script>

<style scoped>
@keyframes grow {
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes pie-grow {
  0% {
    stroke-dasharray: 0 100;
  }
}

.animate-grow {
  animation: grow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-pie-grow {
  animation: pie-grow 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.flex-1:nth-child(1) .animate-grow { animation-delay: 0.1s; }
.flex-1:nth-child(2) .animate-grow { animation-delay: 0.2s; }
.flex-1:nth-child(3) .animate-grow { animation-delay: 0.3s; }
.flex-1:nth-child(4) .animate-grow { animation-delay: 0.4s; }
.flex-1:nth-child(5) .animate-grow { animation-delay: 0.5s; }
.flex-1:nth-child(6) .animate-grow { animation-delay: 0.6s; }
.flex-1:nth-child(7) .animate-grow { animation-delay: 0.7s; }

circle:nth-child(1) { animation-delay: 0.2s; }
circle:nth-child(2) { animation-delay: 0.4s; }
circle:nth-child(3) { animation-delay: 0.6s; }
circle:nth-child(4) { animation-delay: 0.8s; }
</style>