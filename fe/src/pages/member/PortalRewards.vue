<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading rewards...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">Unable to load rewards.</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-6">
      <!-- Back Button -->
      <button 
        @click="router.push('/member/portal')" 
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <Icon icon="mdi:arrow-left" class="h-5 w-5 mr-1" />
        <span>Back</span>
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Available Rewards</h1>
        <p class="mt-2 text-gray-600">
          You have <span class="font-semibold text-amber-600">{{ membership?.points ?? 0 }}</span> points available
        </p>
      </div>

      <!-- Rewards List -->
      <div v-if="rewards.length > 0" class="space-y-6">
        <div
          v-for="reward in rewards"
          :key="reward._id"
          class="group bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <!-- Reward Banner Image -->
          <div class="relative h-48 bg-gray-100 overflow-hidden">
            <img
              v-if="reward.base64Image"
              :src="reward.base64Image"
              :alt="reward.name"
              class="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600">
              <Icon :icon="getRewardIcon(reward)" class="h-16 w-16 text-white" />
            </div>
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>
            <!-- Title overlay -->
            <div class="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
              <h3 class="text-2xl font-bold text-white drop-shadow-lg">{{ reward.name }}</h3>
              <div class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                <span class="text-lg font-bold text-amber-600">{{ reward.pointsCost.toLocaleString() }} pts</span>
              </div>
            </div>
          </div>

          <!-- Reward Content -->
          <div class="p-6">
            <!-- Description -->
            <div class="mb-4">
              <p 
                v-if="reward.description.length <= 70"
                class="text-sm text-gray-500"
              >
                {{ reward.description }}
              </p>
              <div v-else>
                <p 
                  v-if="!reward.expanded"
                  class="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                  @click="toggleDescription(reward)"
                >
                  {{ reward.description.substring(0, 70) }}...
                  <span class="text-amber-600 font-medium ml-1">Read more</span>
                </p>
                <p 
                  v-else
                  class="text-sm text-gray-500"
                >
                  {{ reward.description }}
                  <span 
                    class="text-amber-600 font-medium ml-1 cursor-pointer hover:text-amber-700 transition-colors"
                    @click="toggleDescription(reward)"
                  >
                    Show less
                  </span>
                </p>
              </div>
            </div>
            
            <!-- Redeem Button -->
            <div class="w-full">
              <button
                @click="openRewardDetails(reward)"
                class="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                :class="{
                  'bg-black text-white hover:bg-gray-800 hover:scale-[1.02]': canRedeem(reward),
                  'bg-gray-100 text-gray-400 cursor-not-allowed': !canRedeem(reward)
                }"
                :disabled="!canRedeem(reward)"
              >
                <Icon 
                  :icon="canRedeem(reward) ? 'mdi:gift' : 'mdi:lock'" 
                  class="h-5 w-5"
                />
                <span v-if="!reward.isAvailable">Currently Unavailable</span>
                <span v-else-if="(membership?.points ?? 0) < reward.pointsCost">
                  Need {{ reward.pointsCost - (membership?.points ?? 0) }} More Points
                </span>
                <span v-else>Redeem Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-12 bg-white shadow rounded-xl">
        <Icon icon="mdi:ticket" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No rewards available</h3>
        <p class="mt-1 text-sm text-gray-500">Check back later for new rewards.</p>
      </div>

    </div>

    <!-- Reward Details Modal -->
    <ConfirmationModal
      v-if="selectedReward"
      :show="!!selectedReward"
      :title="selectedReward.name"
      :confirm-text="'Redeem ' + selectedReward.pointsCost + ' Points'"
      :confirm-disabled="!canRedeem(selectedReward)"
      @close="selectedReward = null"
      @confirm="redeemReward"
    >
      <div class="space-y-4">
        <div v-if="selectedReward.imageUrl" class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
          <img :src="selectedReward.imageUrl" :alt="selectedReward.name" class="object-cover" />
        </div>
        
        <p class="text-gray-600">{{ selectedReward.description }}</p>
        
        <div class="border-t border-gray-200 pt-4">
          <h4 class="font-medium text-gray-900 mb-2">Redemption Instructions</h4>
          <p class="text-gray-600">{{ selectedReward.redemptionInstructions || 'Show this reward to staff to redeem.' }}</p>
        </div>
        
        <div v-if="selectedReward.termsAndConditions" class="border-t border-gray-200 pt-4">
          <h4 class="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
          <p class="text-sm text-gray-500">{{ selectedReward.termsAndConditions }}</p>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Your Points</span>
            <span class="font-medium text-gray-900">{{ membership?.points ?? 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-500">Points Required</span>
            <span class="font-medium text-gray-900">{{ selectedReward.pointsCost }}</span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-500">Remaining Points</span>
            <span class="font-medium" :class="{'text-red-600': !canRedeem(selectedReward), 'text-green-600': canRedeem(selectedReward)}">
              {{ (membership?.points ?? 0) - selectedReward.pointsCost }}
            </span>
          </div>
        </div>
      </div>
    </ConfirmationModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import type { Reward, RewardFilters } from '@/types/reward';
import { rewardsApi } from '@/api/rewards';

const store = useStore();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const error = ref(false);
const rewards = ref<Reward[]>([]);
const selectedReward = ref<Reward | null>(null);

// Computed
const membership = computed(() => store.getters['auth/currentMembership']);
const organization = computed(() => store.getters.organization);


// Methods
const fetchRewards = async () => {
  try {
    loading.value = true;
    error.value = false;
    
    const response = await rewardsApi.getRewards();
    
    // Initialize expanded property for description truncation
    rewards.value = response.rewards.map(reward => ({
      ...reward,
      expanded: false
    }));
  } catch (err) {
    error.value = true;
    toast('Failed to load rewards', 'error');
  } finally {
    loading.value = false;
  }
};

const getRewardIcon = (reward: Reward): string => {
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

const canRedeem = (reward: Reward): boolean => {
  const points = membership.value?.points ?? 0;
  return (
    reward.isAvailable &&
    points >= reward.pointsCost &&
    (!reward.quantity || reward.quantity > 0) &&
    (!reward.expiresAt || new Date(reward.expiresAt) > new Date())
  );
};

const getRewardButtonText = (reward: Reward): string => {
  if (!reward.isAvailable) {
    return 'Unavailable';
  }
  if (reward.isExpired) {
    return 'Expired';
  }
  if (reward.isOutOfStock) {
    return 'Out of Stock';
  }
  if ((membership.value?.points ?? 0) < reward.pointsCost) {
    return `Need ${reward.pointsCost - (membership.value?.points ?? 0)} More Points`;
  }
  return 'Redeem Reward';
};

const toggleDescription = (reward: Reward) => {
  reward.expanded = !reward.expanded;
};

const openRewardDetails = (reward: Reward) => {
  selectedReward.value = reward;
};

const redeemReward = async () => {
  if (!selectedReward.value || !canRedeem(selectedReward.value)) {
    return;
  }

  try {
    // TODO: Implement reward redemption API call
    toast('Reward redeemed successfully!', 'success');
    selectedReward.value = null;
    await fetchRewards(); // Refresh rewards list
  } catch (err) {
    toast('Failed to redeem reward', 'error');
  }
};


// Initial load
onMounted(fetchRewards);
</script>
