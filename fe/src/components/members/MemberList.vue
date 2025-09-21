<template>
  <div class="bg-white shadow rounded-lg">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="animate-pulse">
            <td colspan="6" class="px-6 py-4">
              <div class="flex items-center space-x-4">
                <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-else-if="members.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              <div class="flex flex-col items-center py-6">
                <UsersIcon class="h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                <p class="mt-1 text-sm text-gray-500">Get started by adding a new member.</p>
                <div class="mt-6">
                  <button
                    @click="$emit('add')"
                    class="btn btn-primary"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-for="member in members" :key="member._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-lg">
                    {{ member.firstName[0] }}{{ member.lastName[0] }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ member.firstName }} {{ member.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ member.email }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                {
                  'bg-green-100 text-green-800': member.status === 'active',
                  'bg-yellow-100 text-yellow-800': member.status === 'inactive',
                  'bg-red-100 text-red-800': member.status === 'suspended'
                }
              ]">
                {{ member.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                {
                  'bg-gray-100 text-gray-800': member.membershipLevel === 'bronze',
                  'bg-slate-100 text-slate-800': member.membershipLevel === 'silver',
                  'bg-amber-100 text-amber-800': member.membershipLevel === 'gold',
                  'bg-purple-100 text-purple-800': member.membershipLevel === 'platinum'
                }
              ]">
                {{ member.membershipLevel }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ member.points.toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ member.lastVisit ? new Date(member.lastVisit).toLocaleDateString() : 'Never' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <button
                  @click="$emit('edit', member)"
                  class="text-amber-600 hover:text-amber-900"
                >
                  Edit
                </button>
                <button
                  @click="$emit('delete', member)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="$emit('page-change', pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <button
          @click="$emit('page-change', pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="$emit('page-change', pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">Previous</span>
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            <button
              v-for="page in paginationRange"
              :key="page"
              @click="$emit('page-change', page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === pagination.page
                  ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="$emit('page-change', pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">Next</span>
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/outline';

const props = defineProps({
  members: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  }
});

defineEmits(['add', 'edit', 'delete', 'page-change']);

const paginationRange = computed(() => {
  const range = [];
  const maxPages = Math.min(5, props.pagination.pages);
  let start = Math.max(1, props.pagination.page - 2);
  let end = Math.min(props.pagination.pages, start + maxPages - 1);
  
  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});
</script>
