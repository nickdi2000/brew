<template>
  <div class="space-y-6 animate-slide-up">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gradient-blue font-display">Awards Management</h2>
      <button class="btn btn-primary btn-shimmer font-accent">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create New Award
      </button>
    </div>

    <div class="glass-clean rounded-lg overflow-hidden">
      <div class="p-6">
        <!-- Search and Filters -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div class="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search awards..."
              class="input-glass w-full pl-10 pr-4 py-2.5 rounded-lg font-accent transition-all duration-300"
            />
            <svg
              class="absolute left-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div class="flex space-x-3">
            <select class="input-glass px-4 py-2.5 rounded-lg font-accent min-w-[140px] transition-all duration-300">
              <option value="">All Categories</option>
              <option value="achievement">Achievement</option>
              <option value="milestone">Milestone</option>
              <option value="special">Special</option>
            </select>
            <select class="input-glass px-4 py-2.5 rounded-lg font-accent min-w-[120px] transition-all duration-300">
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-accent">
                  Award
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-accent">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-accent">
                  Points
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-accent">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-accent">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/50">
              <tr 
                v-for="(award, index) in awards" 
                :key="award.id"
                class="hover:bg-blue-50/30 transition-colors duration-200 animate-slide-up"
                :style="{ animationDelay: index * 50 + 'ms' }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:scale-110">
                      <img :src="award.image" class="h-10 w-10 object-cover" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 font-accent">{{ award.name }}</div>
                      <div class="text-sm text-gray-500">{{ award.description }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-accent"
                    :class="{
                      'bg-blue-100 text-blue-800': award.category === 'achievement',
                      'bg-purple-100 text-purple-800': award.category === 'milestone',
                      'bg-yellow-100 text-yellow-800': award.category === 'special'
                    }"
                  >
                    {{ award.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 font-display">{{ award.points }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-accent transition-colors duration-200"
                    :class="[
                      award.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ award.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button class="btn btn-secondary btn-sm hover-lift mr-2 font-accent">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button class="text-red-600 hover:text-red-900 font-accent transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6">
          <div class="text-sm text-gray-700 font-accent">
            Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of{' '}
            <span class="font-medium">20</span> results
          </div>
          <div class="flex space-x-2">
            <button class="btn btn-secondary btn-sm hover-lift font-accent">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button class="btn btn-secondary btn-sm hover-lift font-accent">
              Next
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const awards = ref([
  {
    id: 1,
    name: 'First Visit',
    description: 'Awarded on first brewery visit',
    category: 'achievement',
    points: 100,
    status: 'active',
    image: '/images/brewery1.png'
  },
  {
    id: 2,
    name: 'Beer Explorer',
    description: 'Try 5 different craft beers',
    category: 'milestone',
    points: 250,
    status: 'active',
    image: '/images/brewery2.png'
  },
  {
    id: 3,
    name: 'Social Butterfly',
    description: 'Share 3 visits on social media',
    category: 'special',
    points: 150,
    status: 'active',
    image: '/images/brewery3.png'
  },
  {
    id: 4,
    name: 'Weekend Warrior',
    description: 'Visit the brewery 3 weekends in a row',
    category: 'achievement',
    points: 300,
    status: 'active',
    image: '/images/brewery1.png'
  },
  {
    id: 5,
    name: 'Brew Master',
    description: 'Complete the brewery tour',
    category: 'special',
    points: 500,
    status: 'inactive',
    image: '/images/brewery2.png'
  },
  {
    id: 6,
    name: 'Happy Hour Hero',
    description: 'Visit during happy hour 5 times',
    category: 'milestone',
    points: 200,
    status: 'active',
    image: '/images/brewery3.png'
  }
])
</script>
