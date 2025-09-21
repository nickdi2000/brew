<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gradient-blue font-display">Members</h2>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="currentTab = tab.name"
          :class="[
            currentTab === tab.name
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Panels -->
    <div v-if="currentTab === 'all'" class="space-y-6">
      <!-- Filters and Stats (only shown when there are members) -->
      <template v-if="!loading && members.length > 0">
        <!-- Filters -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Search -->
            <div class="relative">
              <input
                type="text"
                v-model="filters.search"
                placeholder="Search members..."
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
              <SearchIcon class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <!-- Status Filter -->
            <select
              v-model="filters.status"
              class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <!-- Membership Level Filter -->
            <select
              v-model="filters.membershipLevel"
              class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            <!-- Sort -->
            <select
              v-model="sortOption"
              class="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="lastName,asc">Name (A-Z)</option>
              <option value="lastName,desc">Name (Z-A)</option>
              <option value="points,desc">Points (High-Low)</option>
              <option value="points,asc">Points (Low-High)</option>
              <option value="createdAt,desc">Newest First</option>
              <option value="createdAt,asc">Oldest First</option>
            </select>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="stat in stats" :key="stat.name" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <component :is="stat.icon" class="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-slate-500 truncate">{{ stat.name }}</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-slate-900">{{ stat.value }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Members List -->
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
                  <p class="mt-1 text-sm text-gray-500">Members will join through your member portal.</p>
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
                    @click="editMember(member)"
                    class="text-amber-600 hover:text-amber-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDeleteMember(member)"
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
                  <ChevronLeftIcon class="h-5 w-5" />
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
                  <ChevronRightIcon class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Config Tab -->
    <div v-if="currentTab === 'config'" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <form @submit.prevent="saveConfig" class="space-y-6">
          <div class="lg:grid lg:grid-cols-2 lg:gap-8">
            <!-- Left Column: Portal Settings -->
            <div class="space-y-6">
              <!-- Member Portal Access -->
              <div>
                <h3 class="text-lg font-medium text-gray-900">Member Portal Access</h3>
                <p class="mt-1 text-sm text-gray-500">Configure how members will access your rewards portal.</p>
              </div>

              <!-- Access Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Access Code</label>
                <div class="mt-1">
                  <div class="flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      v-model="orgConfig.code"
                      class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border-gray-300 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                    <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      .brewtokens.com
                    </span>
                  </div>
                </div>
              </div>

              <!-- Custom Domain -->
              <div>
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-medium text-gray-700">Custom Domain</label>
                  <button
                    type="button"
                    class="text-sm text-gray-500 hover:text-gray-700"
                    @click="orgConfig.useCustomDomain = !orgConfig.useCustomDomain"
                    :disabled="true"
                  >
                    {{ orgConfig.useCustomDomain ? 'Use Subdomain' : 'Use Custom Domain' }}
                  </button>
                </div>
                <div class="mt-1">
                  <input
                    type="text"
                    v-model="orgConfig.customDomain"
                    :disabled="!orgConfig.useCustomDomain"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="rewards.yourdomain.com"
                  />
                  <p class="mt-2 text-sm text-gray-500">Custom domain support coming soon!</p>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-4">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="orgLoading"
                >
                  {{ orgLoading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>

            <!-- Right Column: QR Code -->
            <div class="mt-6 lg:mt-0">
              <div>
                <label class="block text-sm font-medium text-gray-700">QR Code</label>
                <p class="mt-1 text-sm text-gray-500">Scan to access your member portal.</p>
                <div class="mt-4 flex flex-col items-center">
                  <router-link 
                    :to="{ name: 'qr-print', query: { url: memberPortalUrl }}" 
                    class="block p-4 bg-white border rounded-lg hover:border-amber-500 transition-colors duration-200"
                  >
                    <img :src="qrCodeUrl" alt="Member Portal QR Code" class="w-48 h-48" />
                  </router-link>
                  <div class="mt-4 flex space-x-3">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="downloadQRCode"
                    >
                      Download QR Code
                    </button>
                    <router-link 
                      :to="{ name: 'qr-print', query: { url: memberPortalUrl }}"
                      class="btn btn-secondary"
                    >
                      Print View
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modals -->
    <MemberForm
      v-if="showAddMemberModal || showEditMemberModal"
      :member="selectedMember"
      :show="showAddMemberModal || showEditMemberModal"
      @close="closeModal"
      @save="saveMember"
    />

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
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import {
  MagnifyingGlassIcon as SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
  UserGroupIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline';
import MemberForm from '@/components/members/MemberForm.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

const store = useStore();

// State
const currentTab = ref('all');
const showDeleteModal = ref(false);
const selectedMember = ref(null);
const filters = ref({
  search: '',
  status: '',
  membershipLevel: '',
  sort: 'lastName',
  order: 'asc'
});

const orgConfig = ref({
  code: '',
  useCustomDomain: false,
  customDomain: ''
});

const orgLoading = computed(() => store.getters['organization/loading']);

const tabs = [
  { name: 'all', label: 'All Members' },
  { name: 'config', label: 'Configuration' }
];

// Computed
const members = computed(() => store.getters['members/membersList']);
const loading = computed(() => store.getters['members/isLoading']);
const pagination = computed(() => store.getters['members/pagination']);
const error = computed(() => store.getters['members/error']);

const memberPortalUrl = computed(() => {
  if (orgConfig.value.useCustomDomain && orgConfig.value.customDomain) {
    return `https://${orgConfig.value.customDomain}`;
  }
  return `https://${orgConfig.value.code}.brewtokens.com`;
});

const qrCodeUrl = computed(() => {
  const url = encodeURIComponent(memberPortalUrl.value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${url}`;
});

const stats = computed(() => [
  {
    name: 'Total Members',
    value: pagination.value.total.toLocaleString(),
    icon: UserGroupIcon
  },
  {
    name: 'Active Members',
    value: members.value.filter(m => m.status === 'active').length.toLocaleString(),
    icon: UsersIcon
  },
  {
    name: 'Gold+ Members',
    value: members.value.filter(m => ['gold', 'platinum'].includes(m.membershipLevel)).length.toLocaleString(),
    icon: StarIcon
  },
  {
    name: 'Total Points',
    value: store.getters['members/totalPoints'].toLocaleString(),
    icon: ChartBarIcon
  }
]);

const sortOption = computed({
  get: () => `${filters.value.sort},${filters.value.order}`,
  set: (value) => {
    const [sort, order] = value.split(',');
    filters.value.sort = sort;
    filters.value.order = order;
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

const editMember = (member) => {
  selectedMember.value = { ...member };
  showEditMemberModal.value = true;
};

const confirmDeleteMember = (member) => {
  selectedMember.value = member;
  showDeleteModal.value = true;
};

const closeModal = () => {
  showAddMemberModal.value = false;
  showEditMemberModal.value = false;
  selectedMember.value = null;
};

const saveMember = async (memberData) => {
  let success;
  if (showEditMemberModal.value) {
    success = await store.dispatch('members/updateMember', {
      id: selectedMember.value._id,
      data: memberData
    });
  } else {
    success = await store.dispatch('members/createMember', memberData);
  }

  if (success) {
    closeModal();
  }
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

// Watchers
watch(filters, () => {
  store.dispatch('members/setFilters', filters.value);
}, { deep: true });

// Config methods
const saveConfig = async () => {
  try {
    await store.dispatch('organization/updateConfig', orgConfig.value);
    toast('Settings saved successfully', 'success');
  } catch (err) {
    console.error('Failed to save config:', err);
    toast('Failed to save settings', 'error');
  }
};

const downloadQRCode = () => {
  const link = document.createElement('a');
  link.href = qrCodeUrl.value;
  link.download = 'member-portal-qr.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Lifecycle
onMounted(async () => {
  fetchMembers();
  try {
    const config = await store.dispatch('organization/fetchConfig');
    orgConfig.value = { ...orgConfig.value, ...config };
  } catch (error) {
    console.error('Failed to fetch organization config:', error);
    toast('Failed to load organization settings', 'error');
  }
});
</script>
