<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading transactions...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">Unable to load transactions.</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-6 py-8 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p class="text-gray-600">View all your points activity</p>
        </div>
        <button 
          @click="router.back()"
          class="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Icon icon="mdi:arrow-left" class="h-6 w-6" />
        </button>
      </div>

      <!-- Transactions List -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <TransactionHistory 
          :transactions="transactions"
          :loading="transactionsLoading"
          :error="transactionsError"
          :show-view-all="false"
          :limit="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import TransactionHistory from '@/components/members/TransactionHistory.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const error = ref(false);

// Transactions state
const transactions = computed(() => store.getters['transactions/allTransactions']);
const transactionsLoading = computed(() => store.getters['transactions/isLoading']);
const transactionsError = computed(() => store.getters['transactions/error']);
const membership = computed(() => store.getters['auth/currentMembership']);

const fetchTransactions = async () => {
  if (membership.value?._id) {
    try {
      await store.dispatch('transactions/fetchTransactions', membership.value._id);
    } catch (err) {
      error.value = true;
      toast('Failed to load transactions', 'error');
    }
  }
};

onMounted(async () => {
  try {
    // Require auth + membership
    const isAuthenticated = store.getters.isAuthenticated;
    if (!isAuthenticated || !membership.value) {
      router.replace(`/members/${route.params.code}`);
      return;
    }

    await fetchTransactions();
  } finally {
    loading.value = false;
  }
});
</script>
