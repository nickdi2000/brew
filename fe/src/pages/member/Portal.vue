<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading your portal...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">Unable to load member portal.</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-6 py-8 max-w-md mx-auto">
      <!-- Welcome Header -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ organization?.name }}</h1>
        <p class="text-gray-600 text-lg">Welcome back, {{ currentUser?.firstName }}!</p>
      </div>

      <!-- Balance Card - Main Focus -->
      <div class="relative mb-8 animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div class="text-center">
            <div class="text-6xl font-bold text-gray-900 mb-2 animate-count-up">
              {{ membership?.points ?? 0 }}
            </div>
            <p class="text-gray-600 text-lg">Points Available</p>
          </div>
        </div>
      </div>

      <!-- View Rewards Button -->
      <div class="animate-fade-in-up" style="animation-delay: 0.4s">
        <button 
          @click="viewRewards"
          class="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="bg-amber-50 rounded-lg p-3">
                <Icon icon="mdi:trophy" class="h-6 w-6 text-amber-600" />
              </div>
              <div class="text-left">
                <h3 class="text-lg font-semibold text-gray-900">View Rewards</h3>
                <p class="text-sm text-gray-600">Explore available rewards</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-right" class="h-6 w-6 text-gray-400" />
          </div>
        </button>
      </div>

      <!-- Recent Activity Preview -->
      <div class="mt-8 animate-fade-in-up" style="animation-delay: 0.8s">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:clock-outline" class="h-5 w-5 text-gray-500 mr-2" />
            Recent Activity
          </h3>
          <TransactionHistory 
            :transactions="transactions"
            :loading="transactionsLoading"
            :error="transactionsError"
            @view-all="viewAllTransactions"
          />
        </div>
      </div>

      <!-- Fixed Scan Button -->
      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 animate-fade-in-up" style="animation-delay: 0.6s">
        <button 
          @click="goToScan"
          class="w-full bg-black text-white rounded-xl py-4 px-6 flex items-center justify-center space-x-3 shadow-sm relative overflow-hidden"
        >
          <div class="barcode-pattern absolute inset-0 opacity-5"></div>
          <QrScanIcon class="h-8 w-8 relative text-white" />
          <span class="font-semibold text-lg relative">Scan</span>
        </button>
      </div>

      <!-- Add Transaction Modal -->
      <AddTransactionModal
        v-if="membership?._id"
        :show="showAddTransactionModal"
        :member-id="String(membership?._id)"
        @close="showAddTransactionModal = false"
        @transaction-added="handleTransactionAdded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import QrScanIcon from '@/components/icons/QrScanIcon.vue';
import { useToast } from '@/plugins/toast';
import { getOrganizationByCode } from '@/api/organization';
import TransactionHistory from '@/components/members/TransactionHistory.vue';
import AddTransactionModal from '@/components/members/AddTransactionModal.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const error = ref(false);
const organization = ref(null);
const showAddTransactionModal = ref(false);
const currentUser = computed(() => store.getters.currentUser);
const membership = computed(() => store.getters['auth/currentMembership']);

// Transactions state
const transactions = computed(() => store.getters['transactions/allTransactions']);
const transactionsLoading = computed(() => store.getters['transactions/isLoading']);
const transactionsError = computed(() => store.getters['transactions/error']);

const code = computed(() => String(route.params.code || ''));

const fetchOrganization = async () => {
  try {
    const response = await getOrganizationByCode(code.value);
    organization.value = response.data?.data;
  } catch (err) {
    error.value = true;
    toast('Failed to load brewery information', 'error');
  }
};

const viewRewards = () => {
  router.push(`/members/${code.value}/rewards`);
};

const viewAllTransactions = () => {
  router.push(`/members/${code.value}/transactions`);
};

const goToScan = () => {
  router.push(`/members/${code.value}/scan`);
};

const fetchTransactions = async () => {
  if (membership.value?._id) {
    try {
      await store.dispatch('transactions/fetchTransactions', membership.value._id);
    } catch (err) {
      toast('Failed to load transactions', 'error');
    }
  }
};

const handleTransactionAdded = async () => {
  showAddTransactionModal.value = false;
  await fetchTransactions();
  toast('Points added successfully', 'success');
};

onMounted(async () => {
  try {
    // Require auth + membership; otherwise, go back to login/welcome
    const isAuthenticated = store.getters.isAuthenticated;
    if (!isAuthenticated) {
      router.replace(`/members/${code.value}`);
      return;
    }
    if (!membership.value) {
      // Try to load membership by code
      try {
        const { default: api } = await import('@/api');
        const resp = await api.get(`/memberships/by-code/${code.value}`);
        const m = resp.data?.data || null;
        if (m) {
          store.commit('auth/SET_MEMBERSHIP', m);
        } else {
          router.replace(`/members/${code.value}`);
          return;
        }
      } catch {
        router.replace(`/members/${code.value}`);
        return;
      }
    }

    await Promise.all([
      fetchOrganization(),
      fetchTransactions()
    ]);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Base animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.animate-count-up {
  animation: countUp 1.5s ease-out forwards;
}

/* Base animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes countUp {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .animate-fade-in-up {
    animation-delay: 0.1s !important;
  }
}

/* Custom scrollbar for activity section */
.space-y-3::-webkit-scrollbar {
  width: 4px;
}

.space-y-3::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

/* Barcode pattern */
.barcode-pattern {
  background-image: repeating-linear-gradient(
    to right,
    rgba(255, 255, 255, 0.15) 0px,
    rgba(255, 255, 255, 0.15) 3px,
    transparent 3px,
    transparent 6px
  );
  transform: skewX(-15deg) scale(1.5);
}
</style>


