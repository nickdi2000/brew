<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gradient-blue font-display">Members</h2>
      <router-link
        to="/admin/members/new"
        class="btn btn-primary inline-flex items-center"
      >
        <Icon icon="mdi:plus" class="h-5 w-5 mr-2" />
        Add Member
      </router-link>
    </div>

    <div class="space-y-6">
      <!-- Filters - Only show if we have members -->
      <div v-if="!loading && members.length > 0" class="mb-4">
        <div class="flex items-center gap-3">
          <div class="relative max-w-xs w-full sm:w-auto">
            <input
              type="text"
              v-model="filters.search"
              placeholder="Search members..."
              class="w-full text-sm rounded-md border-0 bg-gray-50 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500"
            />
            <Icon icon="mdi:magnify" class="absolute right-2 top-1.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn btn-secondary text-sm"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Members List -->
      <div class="bg-white shadow rounded-lg">
        <!-- Empty State - No Table Needed -->
        <div v-if="!loading && filteredMembers.length === 0" class="px-4 py-12 sm:px-6 sm:py-16">
          <div class="flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <Icon :icon="hasActiveFilters ? 'mdi:magnify-close' : 'mdi:account-group'" class="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mb-4" />
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              <template v-if="hasActiveFilters">No members match your search</template>
              <template v-else>No members yet</template>
            </h3>
            <p class="text-sm sm:text-base text-gray-500 mb-6">
              <template v-if="hasActiveFilters">
                Try adjusting your filters or search terms.
              </template>
              <template v-else>
                Get started by sharing your <router-link to="/admin/qr-codes?tab=portal" class="text-amber-600 hover:text-amber-700 underline font-medium">member portal link</router-link> to start growing your community!
              </template>
            </p>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn btn-secondary inline-flex items-center"
              @click="clearFilters"
            >
              <Icon icon="mdi:filter-remove" class="h-5 w-5 mr-2" />
              Clear filters
            </button>
            <!-- <router-link
              v-else
              to="/admin/members/new"
              class="btn btn-primary inline-flex items-center"
            >
              <Icon icon="mdi:account-plus" class="h-5 w-5 mr-2" />
              Add Your First Member
            </router-link> -->
          </div>
        </div>

        <!-- Table with Members -->
        <div v-else class="overflow-x-auto">
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
              <td colspan="5" class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-for="member in filteredMembers" :key="member._id" class="hover:bg-gray-50 cursor-pointer" @click="goToEdit(member._id)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-lg">
                      {{ (member.firstName || '?')[0] }}{{ (member.lastName || '?')[0] }}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ member.points.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ member.lastVisit ? new Date(member.lastVisit).toLocaleDateString() : 'Never' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click.stop="confirmDeleteMember(member)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <Icon icon="mdi:trash-can" class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          </table>
        </div>

        <!-- Pagination - Only show if we have members -->
        <div v-if="members.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
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
                  @click="prevPage"
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Previous</span>
                  <Icon icon="mdi:chevron-left" class="h-5 w-5" />
                </button>
                <button
                  v-for="page in paginationRange"
                  :key="page"
                  @click="goToPage(page)"
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
                  @click="nextPage"
                  :disabled="pagination.page === pagination.pages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">Next</span>
                  <Icon icon="mdi:chevron-right" class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

    </div>


    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      title="Delete Member"
      :message="'Are you sure you want to delete ' + (selectedMember?.firstName || '') + ' ' + (selectedMember?.lastName || '') + '? This action cannot be undone.'"
      @confirm="deleteMember"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { usePortalLink } from '@/composables/usePortalLink';

const router = useRouter();
const store = useStore();
const { portalLink } = usePortalLink();
const showCopied = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(portalLink.value);
    showCopied.value = true;
    setTimeout(() => {
      showCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

// State
const showDeleteModal = ref(false);
const selectedMember = ref(null);
const filters = ref({
  search: ''
});

// Computed
const members = computed(() => store.getters['members/membersList']);
const loading = computed(() => store.getters['members/isLoading']);
const pagination = computed(() => store.getters['members/pagination']);
const error = computed(() => store.getters['members/error']);

const hasActiveFilters = computed(() => filters.value.search.trim() !== '');

const filteredMembers = computed(() => {
  if (!members.value.length) {
    return [];
  }

  if (!hasActiveFilters.value) {
    return members.value;
  }

  const searchTerm = filters.value.search.trim().toLowerCase();
  return members.value.filter(member => {
    const firstName = member.firstName?.toLowerCase() || '';
    const lastName = member.lastName?.toLowerCase() || '';
    const email = member.email?.toLowerCase() || '';
    return (
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      email.includes(searchTerm)
    );
  });
});

const clearFilters = () => {
  filters.value.search = '';
};

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

// Import toast plugin
import { useToast } from '@/plugins/toast';

// Methods
const toast = useToast();

const fetchMembers = () => {
  store.dispatch('members/fetchMembers', {
    page: pagination.value.page,
    limit: 10
  });
};

const prevPage = () => {
  if (pagination.value.page > 1) {
    store.dispatch('members/fetchMembers', {
      page: pagination.value.page - 1,
      limit: 10
    });
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    store.dispatch('members/fetchMembers', {
      page: pagination.value.page + 1,
      limit: 10
    });
  }
};

const goToPage = (page) => {
  store.dispatch('members/fetchMembers', {
    page,
    limit: 10
  });
};

const confirmDeleteMember = (member) => {
  selectedMember.value = member;
  showDeleteModal.value = true;
};

const deleteMember = async () => {
  if (selectedMember.value) {
    const success = await store.dispatch('members/deleteMember', selectedMember.value._id);
    if (success) {
      showDeleteModal.value = false;
      selectedMember.value = null;
    }
  }
};

const goToEdit = (memberId) => {
  router.push(`/admin/members/${memberId}/edit`);
};

// Watchers

// Lifecycle
onMounted(() => {
  fetchMembers();
});
</script>
