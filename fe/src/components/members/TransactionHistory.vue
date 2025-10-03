<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between" v-if="showAddButton">
      <h4 class="text-sm font-medium text-gray-900">Activity</h4>
      <button
        type="button"
        class="btn btn-primary inline-flex items-center"
        @click="$emit('add-transaction')"
      >
        <Icon icon="mdi:plus-circle" class="h-5 w-5 mr-2" />
        Add Transaction
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-4 text-red-600">
      <Icon icon="mdi:alert" class="h-5 w-5 inline-block mr-1" />
      Failed to load transactions
    </div>

    <div v-else-if="!transactions.length" class="text-center py-4 text-gray-500">
      <Icon icon="mdi:history" class="h-5 w-5 inline-block mr-1" />
      No transactions yet
    </div>

    <template v-else>
      <div
        v-for="transaction in limitedTransactions"
        :key="transaction._id"
        class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
      >
        <div :class="[
          'rounded-full p-1.5 mt-0.5',
          (transaction.amount || 0) > 0 ? 'bg-green-50' : 'bg-red-50'
        ]">
          <Icon
            :icon="(transaction.amount || 0) > 0 ? 'mdi:plus' : 'mdi:minus'"
            :class="[
              'h-3 w-3',
              (transaction.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'
            ]"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ getTransactionTitle(transaction) }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>
            <span :class="[
              'text-sm font-semibold ml-3 flex-shrink-0',
              (transaction.amount || 0) > 0 ? 'text-green-600' : 'text-red-600'
            ]">
              {{ (transaction.amount || 0) > 0 ? '+' : '' }}{{ transaction.amount || 0 }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="showViewAll" class="text-center py-2">
        <button
          @click="$emit('view-all')"
          class="text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors"
        >
          View all activity
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { format } from 'date-fns';

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 5
  },
  showViewAll: {
    type: Boolean,
    default: false
  },
  showAddButton: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view-all', 'add-transaction']);

const limitedTransactions = computed(() => {
  return props.limit ? props.transactions.slice(0, props.limit) : props.transactions;
});

function formatDate(dateValue) {
  try {
    const date = typeof dateValue === 'string' || typeof dateValue === 'number' ? new Date(dateValue) : dateValue;
    if (!date || isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    }
    // If this year, show month and day
    else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }
    // Otherwise show month, day, year
    else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (e) {
    return '';
  }
}

function humanizeMethod(method) {
  switch (method) {
    case 'manual':
      return 'Manual';
    case 'qr_scan':
      return 'QR Scan';
    case 'redemption':
      return 'Redeemed';
    case 'system':
      return 'System';
    case 'promotion':
      return 'Promotion';
    default:
      return method || 'Unknown';
  }
}

function humanizeType(type) {
  switch (type) {
    case 'earn':
      return 'Points Earned';
    case 'redeem':
      return 'Points Redeemed';
    case 'adjust':
      return 'Adjustment';
    default:
      return 'Transaction';
  }
}

function getTransactionTitle(transaction) {
  // If there's a reward, show the reward name
  if (transaction.reward) {
    const rewardName = typeof transaction.reward === 'object' 
      ? transaction.reward.name 
      : transaction.reward;
    
    if (rewardName) {
      return `Redeemed: ${rewardName}`;
    }
  }
  
  // Fall back to metadata description or humanized type
  return transaction.metadata?.description || humanizeType(transaction.type);
}
</script>