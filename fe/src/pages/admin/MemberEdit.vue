<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="flex items-center mb-6">
          <button 
            type="button" 
            @click="router.back()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Icon icon="mdi:arrow-left" class="h-5 w-5 mr-2" />
            Back to Members
          </button>
        </div>
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ memberId ? 'Edit Member' : 'Add New Member' }}
            </h3>
            
            <!-- Tabs -->
            <div class="mt-4 border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.name"
                  @click="currentTab = tab.name"
                  :class="[
                    currentTab === tab.name
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  <Icon :icon="tab.icon" class="h-5 w-5 inline-block mr-2" />
                  {{ tab.label }}
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="mt-4">
              <!-- Profile Tab -->
              <div v-show="currentTab === 'profile'">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="formData.firstName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      v-model="formData.lastName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                <!-- Contact Information -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="formData.email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>

                <!-- Membership Information -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <div class="mt-1 flex rounded-md shadow-sm" role="group" aria-label="Member status">
                      <button
                        type="button"
                        @click="formData.status = 'active'"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'active'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:check-circle" class="h-4 w-4 mr-2" :class="formData.status === 'active' ? 'text-white' : 'text-gray-400'" />
                        Active
                      </button>
                      <button
                        type="button"
                        @click="formData.status = 'inactive'"
                        :class="[
                          'relative -ml-px inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'inactive'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:pause-circle" class="h-4 w-4 mr-2" :class="formData.status === 'inactive' ? 'text-white' : 'text-gray-400'" />
                        Inactive
                      </button>
                      <button
                        type="button"
                        @click="formData.status = 'suspended'"
                        :class="[
                          'relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'suspended'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:block-helper" class="h-4 w-4 mr-2" :class="formData.status === 'suspended' ? 'text-white' : 'text-gray-400'" />
                        Suspended
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Points -->
                <div v-if="memberId">
                  <label class="block text-sm font-medium text-gray-700">Points Balance</label>
                  <div class="mt-1 flex items-center">
                    <span class="text-2xl font-semibold text-amber-600">{{ currentBalance }}</span>
                    <span class="ml-2 text-sm text-gray-500">points</span>
                  </div>
                </div>

                <!-- Password (only for new members) -->
                <div v-if="!memberId">
                  <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    v-model="formData.password"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>

                <!-- Error Message -->
                <div v-if="error" class="rounded-md bg-red-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <Icon icon="mdi:close-circle" class="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">
                        {{ error }}
                      </h3>
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="router.back()"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                    <span v-else>
                      {{ memberId ? 'Save Changes' : 'Create Member' }}
                    </span>
                  </button>
                </div>
              </form>
              </div>

              <!-- Activity Tab -->
              <div v-show="currentTab === 'activity'" class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">Points Balance</h4>
                    <p class="text-3xl font-bold text-amber-600">{{ currentBalance }} points</p>
                  </div>
                </div>

                <TransactionHistory 
                  :transactions="transactions"
                  :loading="transactionsLoading"
                  :error="!!transactionsError"
                  :show-add-button="true"
                  @add-transaction="showAddTransactionModal = true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Transaction Modal -->
  <AddTransactionModal
    v-if="memberId"
    :show="showAddTransactionModal"
    :member-id="memberId"
    @close="showAddTransactionModal = false"
    @transaction-added="handleTransactionAdded"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import TransactionHistory from '@/components/members/TransactionHistory.vue';
import AddTransactionModal from '@/components/members/AddTransactionModal.vue';

const router = useRouter();
const route = useRoute();
const store = useStore();
const toast = useToast();

const memberId = ref(route.params.id);
const loading = ref(false);
const error = ref(null);
const currentTab = ref('profile');
const showAddTransactionModal = ref(false);

const tabs = [
  { name: 'profile', label: 'Profile', icon: 'mdi:account' },
  { name: 'activity', label: 'Activity', icon: 'mdi:history' }
];

// Transaction-related state
const transactions = computed(() => store.getters['transactions/allTransactions']);
const transactionsLoading = computed(() => store.getters['transactions/isLoading']);
const currentBalance = computed(() => store.getters['transactions/currentBalance']);
const transactionsError = computed(() => store.getters['transactions/error']);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  membershipLevel: 'bronze',
  status: 'active',
  password: ''
});

const initForm = async () => {
  if (memberId.value) {
    try {
      loading.value = true;
      await store.dispatch('members/fetchMemberDetails', memberId.value);
      const member = store.getters['members/currentMember'];
      if (!member) {
        error.value = 'Failed to load member details';
        toast('Failed to load member details', 'error');
        return;
      }
      formData.value = {
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        membershipLevel: member.membershipLevel || 'bronze',
        status: member.status || 'active'
      };
    } catch (err) {
      error.value = 'Failed to load member details';
      toast('Failed to load member details', 'error');
    } finally {
      loading.value = false;
    }
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      membershipLevel: 'bronze',
      status: 'active',
      points: 0,
      password: ''
    };
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    if (memberId.value) {
      await store.dispatch('members/updateMember', {
        id: memberId.value,
        data: formData.value
      });
      toast('Member updated successfully', 'success');
    } else {
      await store.dispatch('members/createMember', formData.value);
      toast('Member created successfully', 'success');
    }
    
    router.push('/admin/members');
  } catch (err) {
    error.value = err.message || 'An error occurred while saving the member.';
    toast(error.value, 'error');
  } finally {
    loading.value = false;
  }
};


const handleTransactionAdded = async (transactionData) => {
  try {
    await store.dispatch('transactions/createTransaction', {
      memberId: memberId.value,
      transactionData
    });
    // Refresh both the balance and transaction list
    await Promise.all([
      store.dispatch('transactions/fetchBalance', memberId.value),
      store.dispatch('transactions/fetchTransactions', memberId.value)
    ]);
    toast('Transaction added successfully', 'success');
  } catch (err) {
    toast('Failed to add transaction', 'error');
  }
};

const loadTransactions = async () => {
  if (memberId.value) {
    try {
      await store.dispatch('transactions/fetchTransactions', memberId.value);
      await store.dispatch('transactions/fetchBalance', memberId.value);
    } catch (err) {
      toast('Failed to load transactions', 'error');
    }
  }
};

onMounted(() => {
  initForm();
  loadTransactions();
});
</script>
