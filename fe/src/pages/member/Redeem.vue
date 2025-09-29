<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <Icon icon="mdi:alert-circle" class="mx-auto h-12 w-12 text-red-500" />
      <h3 class="mt-2 text-lg font-medium text-gray-900">Failed to load reward</h3>
      <p class="mt-1 text-gray-500">{{ errorMessage }}</p>
      <button 
        @click="router.back()" 
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
      >
        <Icon icon="mdi:arrow-left" class="mr-2 h-5 w-5" />
        Go Back
      </button>
    </div>

    <div v-else class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Confirm Redemption</h1>
        <p class="mt-2 text-gray-600">Please review the details before redeeming your reward</p>
      </div>

      <!-- Reward Card -->
      <div v-if="reward" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Reward Banner Image -->
        <div class="relative h-48 bg-gray-100">
          <img
            v-if="reward.base64Image"
            :src="reward.base64Image"
            :alt="reward.name"
            class="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600">
            <Icon :icon="getRewardIcon(reward)" class="h-16 w-16 text-white" />
          </div>
        </div>

        <!-- Reward Content -->
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ reward.name }}</h2>
          <p class="mt-2 text-gray-600">{{ reward.description }}</p>

          <!-- Points Summary -->
          <div class="mt-6 space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Your Current Points</span>
              <span class="font-medium text-gray-900">{{ membership?.points ?? 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">Points Required</span>
              <span class="font-medium text-gray-900">{{ reward.pointsCost }}</span>
            </div>
            <div class="flex justify-between items-center border-t border-gray-200 pt-3">
              <span class="text-gray-500">Remaining Points</span>
              <span class="font-medium text-gray-900">{{ (membership?.points ?? 0) - reward.pointsCost }}</span>
            </div>
          </div>

          <!-- Redemption Instructions -->
          <div class="mt-6">
            <h3 class="font-medium text-gray-900">Redemption Instructions</h3>
            <p class="mt-2 text-sm text-gray-600">
              {{ reward.redemptionInstructions || 'Show this reward to staff to redeem.' }}
            </p>
          </div>

          <!-- Terms & Conditions -->
          <div v-if="reward.termsAndConditions" class="mt-6">
            <h3 class="font-medium text-gray-900">Terms & Conditions</h3>
            <p class="mt-2 text-sm text-gray-500">{{ reward.termsAndConditions }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-4">
        <button
          @click="redeemReward"
          :disabled="isRedeeming || !canRedeem"
          class="w-full btn btn-primary flex items-center justify-center gap-2 py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon 
            :icon="isRedeeming ? 'mdi:loading' : 'mdi:gift'" 
            :class="{'animate-spin': isRedeeming}"
            class="h-6 w-6" 
          />
          {{ isRedeeming ? 'Redeeming...' : 'Confirm Redemption' }}
        </button>

        <button
          @click="router.back()"
          :disabled="isRedeeming"
          class="w-full btn btn-secondary flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:arrow-left" class="h-5 w-5" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import { rewardsApi } from '@/api/rewards';
import type { Reward } from '@/types/reward';

const router = useRouter();
const route = useRoute();
const store = useStore();
const toast = useToast();

// State
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const reward = ref<Reward | null>(null);
const isRedeeming = ref(false);

// Computed
const membership = computed(() => store.getters['auth/currentMembership']);
const canRedeem = computed(() => {
  if (!reward.value) return false;
  const points = membership.value?.points ?? 0;
  return (
    reward.value.isAvailable &&
    points >= reward.value.pointsCost &&
    (!reward.value.quantity || reward.value.quantity > 0) &&
    (!reward.value.expiresAt || new Date(reward.value.expiresAt) > new Date())
  );
});

// Methods
const fetchReward = async () => {
  try {
    loading.value = true;
    error.value = false;
    const rewardId = route.params.id as string;
    const response = await rewardsApi.getReward(rewardId);
    reward.value = response; // API returns the reward directly
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Failed to load reward details. Please try again.';
    console.error('Error fetching reward:', err);
  } finally {
    loading.value = false;
  }
};

const getRewardIcon = (reward: Reward | null): string => {
  if (!reward) return 'mdi:gift';
  const customIcons: Record<string, string> = {
    'Birthday Reward': 'mdi:cake',
    'VIP Experience': 'mdi:star',
    'Mystery Brew': 'mdi:flask',
    'Loyalty Bonus': 'mdi:heart',
    'Achievement': 'mdi:trophy'
  };

  if (customIcons[reward.name]) {
    return customIcons[reward.name];
  }

  switch (reward.type) {
    case 'product':
      return 'mdi:gift';
    case 'service':
      return 'mdi:sparkles';
    case 'discount':
      return 'mdi:ticket';
    case 'experience':
      return 'mdi:star';
    default:
      return 'mdi:gift';
  }
};

const redeemReward = async () => {
  if (!reward.value || !canRedeem.value || isRedeeming.value) return;

  try {
    isRedeeming.value = true;
    await rewardsApi.redeemReward(reward.value._id, membership.value?.id);

    // Update points in Vuex store
    const newPoints = (membership.value?.points ?? 0) - reward.value.pointsCost;
    store.commit('auth/UPDATE_MEMBERSHIP_POINTS', newPoints);

    // Navigate back to rewards with success message preserved in query
    const code = route.params.code as string;
    router.push({
      name: 'member-rewards',
      params: { code },
      query: {
        redeemed: '1',
        rewardId: reward.value._id,
        rewardName: reward.value.name
      }
    });
  } catch (err) {
    toast('Failed to redeem reward. Please try again.', 'error');
    console.error('Error redeeming reward:', err);
  } finally {
    isRedeeming.value = false;
  }
};

// Lifecycle
onMounted(fetchReward);
</script>
