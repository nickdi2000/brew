<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Search -->
        <div class="relative">
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search rewards..."
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          />
          <Icon icon="mdi:magnify" class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <!-- Type Filter -->
        <select
          v-model="filters.type"
          class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        >
          <option value="">All Types</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
          <option value="discount">Discount</option>
          <option value="experience">Experience</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="filters.isActive"
          class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        >
          <option :value="undefined">All Status</option>
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortOption"
          class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        >
          <option value="name,asc">Name (A-Z)</option>
          <option value="name,desc">Name (Z-A)</option>
          <option value="pointsCost,desc">Points (High-Low)</option>
          <option value="pointsCost,asc">Points (Low-High)</option>
          <option value="createdAt,desc">Newest First</option>
          <option value="createdAt,asc">Oldest First</option>
        </select>
      </div>
    </div>

    <!-- Rewards Grid -->
    <div v-if="!loading && rewards.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="reward in rewards"
        :key="reward._id"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
      >
        <!-- Reward Image -->
        <div class="aspect-w-16 aspect-h-9 bg-gray-200">
          <img
            v-if="reward.imageUrl"
            :src="reward.imageUrl"
            :alt="reward.name"
            class="object-cover"
          />
          <div v-else class="flex items-center justify-center h-full bg-gray-100">
            <Icon icon="mdi:gift" class="h-12 w-12 text-gray-400" />
          </div>
        </div>

        <!-- Reward Content -->
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ reward.name }}</h3>
              <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ reward.description }}</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                'bg-green-100 text-green-800': reward.isAvailable,
                'bg-red-100 text-red-800': !reward.isAvailable
              }"
            >
              {{ reward.isAvailable ? 'Available' : 'Unavailable' }}
            </span>
          </div>

          <div class="mt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Type</span>
              <span class="font-medium text-gray-900 capitalize">{{ reward.type }}</span>
            </div>
            <div class="flex items-center justify-between text-sm mt-2">
              <span class="text-gray-500">Points Required</span>
              <span class="font-medium text-gray-900">{{ reward.pointsCost.toLocaleString() }}</span>
            </div>
            <div v-if="reward.quantity !== null" class="flex items-center justify-between text-sm mt-2">
              <span class="text-gray-500">Quantity Left</span>
              <span class="font-medium text-gray-900">{{ reward.quantity }}</span>
            </div>
            <div v-if="reward.expiresAt" class="flex items-center justify-between text-sm mt-2">
              <span class="text-gray-500">Expires</span>
              <span class="font-medium text-gray-900">{{ new Date(reward.expiresAt).toLocaleDateString() }}</span>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="$emit('edit', reward)"
              class="btn btn-secondary btn-sm"
            >
              Edit
            </button>
            <button
              @click="$emit('delete', reward)"
              class="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div class="aspect-w-16 aspect-h-9 bg-gray-200"></div>
        <div class="p-6 space-y-4">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white shadow rounded-lg">
      <Icon icon="mdi:gift" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No rewards</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new reward.</p>
      <div class="mt-6">
        <button
          @click="$emit('create')"
          class="btn btn-primary"
        >
          Create New Reward
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && rewards.length > 0" class="flex items-center justify-between bg-white px-4 py-3 shadow rounded-lg sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          @click="prevPage"
          :disabled="pagination.page === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ ((pagination.page - 1) * 10) + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(pagination.page * 10, pagination.total) }}</span>
            of
            <span class="font-medium">{{ pagination.total }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span class="sr-only">Previous</span>
              <Icon icon="mdi:chevron-left" class="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              v-for="page in paginationRange"
              :key="page"
              @click="goToPage(page)"
              :class="[
                page === pagination.page
                  ? 'relative z-10 inline-flex items-center bg-amber-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600'
                  : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page === pagination.pages"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span class="sr-only">Next</span>
              <Icon icon="mdi:chevron-right" class="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import type { Reward, RewardFilters } from '@/types/reward';

const store = useStore();

// Props & Emits
defineEmits(['edit', 'delete', 'create']);

// Computed
const rewards = computed(() => store.getters['rewards/rewardsList']);
const loading = computed(() => store.getters['rewards/isLoading']);
const pagination = computed(() => store.getters['rewards/pagination']);
const filters = computed({
  get: () => store.getters['rewards/filters'],
  set: (value: RewardFilters) => store.dispatch('rewards/setFilters', value)
});

const sortOption = computed({
  get: () => `${filters.value.sortBy},${filters.value.sortOrder}`,
  set: (value: string) => {
    const [sortBy, sortOrder] = value.split(',');
    store.dispatch('rewards/setFilters', {
      ...filters.value,
      sortBy,
      sortOrder
    });
  }
});

const paginationRange = computed(() => {
  const range = [];
  const maxPages = Math.min(5, pagination.value.pages);
  let start = Math.max(1, pagination.value.page - 2);
  let end = Math.min(pagination.value.pages, start + maxPages - 1);
  
  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});

// Methods
const prevPage = () => {
  if (pagination.value.page > 1) {
    store.dispatch('rewards/setPage', pagination.value.page - 1);
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    store.dispatch('rewards/setPage', pagination.value.page + 1);
  }
};

const goToPage = (page: number) => {
  store.dispatch('rewards/setPage', page);
};
</script>
