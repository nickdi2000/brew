<template>
  <div class="h-full bg-gray-50 relative overflow-hidden">
    <div class="container mx-auto px-4 py-8 h-full overflow-hidden">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">Last 30 Days</div>
          <button class="btn btn-secondary text-sm opacity-50 cursor-not-allowed">
            <i class="fas fa-calendar-alt mr-2"></i>
            Change Date Range
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Key Metrics Cards -->
        <div v-for="metric in keyMetrics" :key="metric.title" 
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">{{ metric.title }}</p>
              <h3 class="text-2xl font-bold text-gray-900">{{ metric.value }}</h3>
            </div>
            <div :class="['text-lg', metric.trend === 'up' ? 'text-green-500' : 'text-red-500']">
              <i :class="metric.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ metric.percentage }}%
            </div>
          </div>
          <div class="mt-2">
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div :style="{ width: metric.percentage + '%' }" 
                :class="['h-full rounded-full', metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500']">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Member Growth Chart -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
          <div class="h-64 flex items-end justify-between gap-2">
            <div v-for="bar in memberGrowth" :key="bar.month" class="flex-1">
              <div 
                :style="{ height: bar.height + '%' }" 
                class="bg-blue-500 rounded-t-sm transform origin-bottom animate-grow"
              ></div>
              <div class="text-xs text-gray-500 mt-2 text-center">{{ bar.month }}</div>
            </div>
          </div>
        </div>

        <!-- Points Distribution Chart -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Points Distribution</h3>
          <div class="flex items-center justify-center h-64">
            <div class="relative w-48 h-48">
              <svg viewBox="0 0 100 100" class="transform -rotate-90">
                <circle v-for="(segment, index) in pointsDistribution" :key="index"
                  :stroke-dasharray="`${segment.percentage} 100`"
                  :stroke-dashoffset="-index * segment.percentage"
                  :stroke="segment.color"
                  stroke-width="32"
                  fill="none"
                  r="16"
                  cx="50"
                  cy="50"
                  class="transition-all duration-2000 animate-pie-grow"
                />
              </svg>
            </div>
            <div class="ml-8">
              <div v-for="segment in pointsDistribution" :key="segment.label" 
                class="flex items-center gap-2 mb-2">
                <div :style="{ backgroundColor: segment.color }" class="w-3 h-3 rounded-full"></div>
                <span class="text-sm text-gray-600">{{ segment.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="activity in recentActivity" :key="activity.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ activity.member }}</div>
                      <div class="text-sm text-gray-500">{{ activity.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ activity.action }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    activity.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ activity.points > 0 ? '+' : '' }}{{ activity.points }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ activity.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Coming Soon Overlay -->
    <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <i class="fas fa-chart-line text-6xl text-blue-500 mb-4"></i>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Analytics Coming Soon</h2>
        <p class="text-gray-600">We're working hard to bring you powerful insights about your loyalty program.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const keyMetrics = ref([
  { title: 'Total Members', value: '2,847', trend: 'up', percentage: 12 },
  { title: 'Active Members', value: '1,923', trend: 'up', percentage: 8 },
  { title: 'Points Awarded', value: '45,231', trend: 'up', percentage: 15 },
  { title: 'Redemption Rate', value: '68%', trend: 'down', percentage: 5 },
]);

const memberGrowth = ref([
  { month: 'Jan', height: 45 },
  { month: 'Feb', height: 52 },
  { month: 'Mar', height: 58 },
  { month: 'Apr', height: 65 },
  { month: 'May', height: 72 },
  { month: 'Jun', height: 80 },
  { month: 'Jul', height: 85 },
]);

const pointsDistribution = ref([
  { label: 'Check-ins', percentage: 35, color: '#3B82F6' },
  { label: 'Purchases', percentage: 25, color: '#10B981' },
  { label: 'Referrals', percentage: 20, color: '#6366F1' },
  { label: 'Events', percentage: 20, color: '#F59E0B' },
]);

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
]);
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

/* Add staggered delay to bars */
.flex-1:nth-child(1) .animate-grow { animation-delay: 0.1s; }
.flex-1:nth-child(2) .animate-grow { animation-delay: 0.2s; }
.flex-1:nth-child(3) .animate-grow { animation-delay: 0.3s; }
.flex-1:nth-child(4) .animate-grow { animation-delay: 0.4s; }
.flex-1:nth-child(5) .animate-grow { animation-delay: 0.5s; }
.flex-1:nth-child(6) .animate-grow { animation-delay: 0.6s; }
.flex-1:nth-child(7) .animate-grow { animation-delay: 0.7s; }

/* Add staggered delay to pie chart segments */
circle:nth-child(1) { animation-delay: 0.2s; }
circle:nth-child(2) { animation-delay: 0.4s; }
circle:nth-child(3) { animation-delay: 0.6s; }
circle:nth-child(4) { animation-delay: 0.8s; }
</style>