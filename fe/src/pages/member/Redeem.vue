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
        <p class="mt-2 text-gray-600">Quickly review the essentials. Tap below if you need the full details.</p>
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

          <div class="mt-3">
            <p class="text-sm text-gray-600 line-clamp-3" v-if="!showDetails">{{ reward.description }}</p>
            <div v-else class="space-y-3 text-sm text-gray-600">
              <p>{{ reward.description }}</p>

              <div class="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <h3 class="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <Icon icon="mdi:information" class="h-4 w-4" />
                  How redemption works
                </h3>
                <p class="mt-1 text-xs text-amber-700">
                  Slide to confirm when you are ready to redeem. Staff will validate this reward in person.
                </p>
              </div>

              <div class="space-y-2">
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Icon icon="mdi:clipboard-text" class="h-4 w-4 text-amber-600" />
                    Redemption Instructions
                  </h3>
                  <p class="mt-1 text-xs text-gray-600">
                    {{ reward.redemptionInstructions || 'Show this reward to staff to redeem.' }}
                  </p>
                </div>

                <div v-if="reward.termsAndConditions">
                  <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Icon icon="mdi:shield-check" class="h-4 w-4 text-amber-600" />
                    Terms & Conditions
                  </h3>
                  <p class="mt-1 text-xs text-gray-600">
                    {{ reward.termsAndConditions }}
                  </p>
                </div>
              </div>
            </div>

            <button
              class="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700 focus:outline-none"
              @click="toggleDetails"
            >
              <span class="inline-flex items-center gap-2">
                <Icon :icon="showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="h-4 w-4" />
                {{ showDetails ? 'Hide' : 'See more' }} details
              </span>
            </button>
          </div>

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

        </div>
      </div>

      <!-- Action Section -->
      <div class="space-y-4">
        <SlideToConfirm
          :disabled="!canRedeem"
          :loading="isRedeeming"
          :title="reward?.name"
          :subtitle="`Redeem for ${reward?.pointsCost ?? 0} points`"
          label="Slide to redeem"
          confirm-label="Keep sliding to confirm"
          success-label="Redeemed"
          helper-text="Slide fully to the right to confirm redemption"
          success-icon="mdi:gift-open"
          icon="mdi:gesture-swipe-right"
          @confirm="redeemReward"
        />

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
import SlideToConfirm from '@/components/member/SlideToConfirm.vue';

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
const showDetails = ref(false);

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

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

// Lifecycle
onMounted(fetchReward);
</script>
