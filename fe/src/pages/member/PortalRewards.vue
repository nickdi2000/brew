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
      <!-- Success Screen - Show only when redeemed -->
      <div v-if="route.query.redeemed === '1'" class="min-h-xl flex items-center justify-center p-4">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border border-green-200 max-w-md w-full mx-auto">
          <div class="flex flex-col items-center space-y-4">
            <!-- Success Icons (Smaller) -->
            <div class="relative">
              <div class="flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
                <Icon icon="mdi:check-circle" class="h-12 w-12 text-green-600" />
              </div>
              <div class="absolute -right-2 -top-2 animate-bounce">
                <Icon icon="mdi:party-popper" class="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <!-- Success Message (Condensed) -->
            <div class="text-center">
              <h1 class="text-3xl font-bold text-green-800">Success!</h1>
              <p class="text-lg text-green-700 font-medium mt-1">Reward redeemed successfully</p>
            </div>
            
            <!-- Reward Name (Compact) -->
            <div v-if="route.query.rewardName" class="w-full">
              <div class="bg-white rounded-xl p-4 shadow border border-green-100">
                <p class="text-base text-gray-800 font-medium text-center">{{ String(route.query.rewardName) }}</p>
              </div>
            </div>
            
            <!-- Action Button (Smaller) -->
            <button 
              @click="router.push(`/members/${route.params.code}`)" 
              class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:arrow-left" class="h-5 w-5" />
              Back to Portal
            </button>
          </div>
        </div>
      </div>
      
      <!-- Regular Content - Hidden when showing success -->
      <div v-else>
        <!-- Back Button -->
        <button 
          @click="router.push(`/members/${route.params.code}`)" 
          class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <Icon icon="mdi:arrow-left" class="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>



        <!-- Rewards List -->
        <div v-if="rewards.length > 0" class="space-y-6">
          <div
            v-for="reward in sortedRewards"
            :key="reward._id"
            :class="[
              'group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-200',
              canRedeem(reward) 
                ? 'bg-white ring-2 ring-green-400 ring-opacity-50' 
                : 'bg-gray-50 opacity-75'
            ]"
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
              <!-- Eligibility Status -->
              <div class="mb-4">
                <span 
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    canRedeem(reward)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  ]"
                >
                  <Icon 
                    :icon="canRedeem(reward) ? 'mdi:check-circle' : 'mdi:lock'" 
                    class="mr-1.5 h-4 w-4"
                  />
                  {{ canRedeem(reward) ? 'Eligible' : 'Not enough points' }}
                </span>
              </div>
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
                  @click="navigateToRedeem(reward)"
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
                  <span v-if="!reward.isActive">Currently Unavailable</span>
                  <span v-else-if="reward.isExpired || (reward.expiresAt && new Date(reward.expiresAt) <= new Date())">Expired</span>
                  <span v-else-if="reward.isOutOfStock || (typeof reward.quantity === 'number' && reward.quantity <= 0)">Out of Stock</span>
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

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import type { Reward } from '@/types/reward';
import { rewardsApi } from '@/api/rewards';

const store = useStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// State
const loading = ref(true);
const error = ref(false);
const rewards = ref<Reward[]>([]);

// Computed
const membership = computed(() => store.getters['auth/currentMembership']);
const organization = computed(() => store.getters.organization);

const sortedRewards = computed(() => {
  return [...rewards.value].sort((a, b) => {
    const aEligible = canRedeem(a);
    const bEligible = canRedeem(b);
    if (aEligible && !bEligible) return -1;
    if (!aEligible && bEligible) return 1;
    return 0;
  });
});


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
  const quantityAvailable = reward.quantity === null || reward.quantity > 0;
  const notExpired = !reward.expiresAt || new Date(reward.expiresAt) > new Date();

  return reward.isActive && quantityAvailable && notExpired && points >= reward.pointsCost;
};

const getRewardButtonText = (reward: Reward): string => {
  if (!reward.isActive) {
    return 'Unavailable';
  }
  if (reward.isExpired || (reward.expiresAt && new Date(reward.expiresAt) <= new Date())) {
    return 'Expired';
  }
  if (reward.isOutOfStock || (typeof reward.quantity === 'number' && reward.quantity <= 0)) {
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

const navigateToRedeem = (reward: Reward) => {
  if (!canRedeem(reward)) return;
  const code = route.params.code;
  router.push({ 
    name: 'member-redeem',
    params: { 
      code,
      id: reward._id 
    }
  });
};

const clearRedeemedQuery = () => {
  router.replace({
    name: 'member-rewards',
    params: { code: route.params.code },
    query: {}
  });
};


// Initial load
onMounted(async () => {
  try {
    await fetchRewards();
  } catch (err) {
    console.error('❌ Failed to load rewards:', err);
    toast('Failed to load rewards', 'error');
  }
});
</script>
