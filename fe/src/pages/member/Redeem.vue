<template>
  <!-- Full height native app-style layout within container -->
  <div class="relative bg-gray-50 flex flex-col" style="min-height: calc(100vh - 140px);">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex justify-center items-center bg-white z-50">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex flex-col items-center justify-center px-6 bg-white z-50">
      <Icon icon="mdi:alert-circle" class="h-16 w-16 text-red-500" />
      <h3 class="mt-4 text-xl font-semibold text-gray-900">Failed to load reward</h3>
      <p class="mt-2 text-gray-600 text-center">{{ errorMessage }}</p>
      <button 
        @click="router.back()" 
        class="mt-6 px-6 py-3 rounded-full bg-amber-600 text-white font-medium shadow-lg active:scale-95 transition-transform"
      >
        <Icon icon="mdi:arrow-left" class="inline mr-2 h-5 w-5" />
        Go Back
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col flex-1">
      <!-- Fixed Header with Back Button -->
      <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div class="px-4 py-3 flex items-center">
          <button
            @click="router.back()"
            :disabled="isRedeeming"
            class="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Icon icon="mdi:arrow-left" class="h-6 w-6 text-gray-700" />
          </button>
          <h1 class="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">Confirm Redemption</h1>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto pb-[220px]">
        <div class="min-h-full pb-8">
          <!-- Reward Banner Image -->
          <div v-if="reward" class="relative h-64 bg-gray-100">
            <img
              v-if="reward.base64Image"
              :src="reward.base64Image"
              :alt="reward.name"
              class="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600">
              <Icon :icon="getRewardIcon(reward)" class="h-24 w-24 text-white drop-shadow-lg" />
            </div>
          </div>

          <!-- Reward Content -->
          <div v-if="reward" class="bg-white px-6 py-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ reward.name }}</h2>
            <p class="mt-1 text-sm text-amber-600 font-medium">{{ reward.pointsCost }} points</p>

            <!-- Expandable Details -->
            <div v-if="showDetails" class="mt-6 space-y-4 pb-4">
              <!-- Description -->
              <div>
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:text" class="h-4 w-4 text-amber-600" />
                  Description
                </h3>
                <p class="mt-1 text-sm text-gray-600">{{ reward.description }}</p>
              </div>

              <!-- How Redemption Works -->
              <div class="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h3 class="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <Icon icon="mdi:information" class="h-4 w-4" />
                  How redemption works
                </h3>
                <p class="mt-1 text-xs text-amber-700">
                  Slide to confirm when you are ready to redeem. Staff will validate this reward in person.
                </p>
              </div>

              <!-- Redemption Instructions -->
              <div>
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:clipboard-text" class="h-4 w-4 text-amber-600" />
                  Redemption Instructions
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ reward.redemptionInstructions || 'Show this reward to staff to redeem.' }}
                </p>
              </div>

              <!-- Terms & Conditions -->
              <div v-if="reward.termsAndConditions">
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:shield-check" class="h-4 w-4 text-amber-600" />
                  Terms & Conditions
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ reward.termsAndConditions }}
                </p>
              </div>

              <!-- Points Summary -->
              <div class="border-t border-gray-200 pt-4 space-y-3 text-sm">
                <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:coins" class="h-4 w-4 text-amber-600" />
                  Points Breakdown
                </h3>
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
                  <span class="font-semibold text-gray-900">{{ (membership?.points ?? 0) - reward.pointsCost }}</span>
                </div>
              </div>
            </div>

            <!-- Toggle Details Button -->
            <button
              class="mt-6 text-sm font-medium text-amber-600 hover:text-amber-700 active:text-amber-800 focus:outline-none w-full py-3 border border-amber-200 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-all"
              @click="toggleDetails"
            >
              <span class="inline-flex items-center gap-2">
                <Icon :icon="showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="h-5 w-5" />
                {{ showDetails ? 'Hide' : 'See more' }} details
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Fixed Bottom Action Area with Glow -->
      <div 
        class="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto z-30 border-t transition-all duration-700"
        :class="redemptionSuccess ? 'bg-emerald-800 border-emerald-700' : 'bg-slate-800 border-slate-700'"
      >
        <!-- Success State -->
        <transition
          enter-active-class="transition-all duration-700 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-8"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div v-if="redemptionSuccess" class="px-6 py-8">
            <!-- Success Icon and Message -->
            <div class="text-center mb-6">
              <div class="relative inline-block animate-success-bounce">
                <!-- Animated success glow -->
                <div class="absolute inset-0 bg-emerald-400/40 blur-2xl rounded-full animate-pulse-slow"></div>
                <div class="absolute inset-0 bg-emerald-300/30 blur-xl rounded-full"></div>
                <Icon icon="mdi:check-circle" class="relative h-20 w-20 text-emerald-300 drop-shadow-lg animate-success-rotate" />
              </div>
              <h2 class="mt-4 text-2xl font-bold text-white animate-slide-up">Redeemed Successfully!</h2>
              <p class="mt-2 text-emerald-200 animate-slide-up-delay">{{ reward?.name }}</p>
            </div>

            <!-- Time Elapsed -->
            <div class="bg-emerald-900/40 rounded-xl p-4 border border-emerald-600/30 animate-fade-in-delay-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:clock-outline" class="h-5 w-5 text-emerald-300" />
                  <span class="text-sm font-medium text-emerald-100">Redeemed</span>
                </div>
                <span class="text-sm font-semibold text-emerald-200">{{ timeElapsed }}</span>
              </div>
            </div>

            <!-- Points Deducted Info -->
            <div class="mt-4 bg-emerald-900/40 rounded-xl p-4 border border-emerald-600/30 animate-fade-in-delay-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:minus-circle" class="h-5 w-5 text-emerald-300" />
                  <span class="text-sm font-medium text-emerald-100">Points Used</span>
                </div>
                <span class="text-sm font-semibold text-emerald-200">{{ reward?.pointsCost }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between pt-3 border-t border-emerald-600/30">
                <div class="flex items-center gap-2">
                  <Icon icon="mdi:wallet" class="h-5 w-5 text-emerald-300" />
                  <span class="text-sm font-medium text-emerald-100">Current Balance</span>
                </div>
                <span class="text-sm font-semibold text-emerald-200">{{ membership?.points ?? 0 }}</span>
              </div>
            </div>

            <!-- Back to Rewards Button -->
            <button
              @click="router.back()"
              class="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 animate-fade-in-delay-3"
            >
              <Icon icon="mdi:arrow-left" class="h-5 w-5" />
              Back to Rewards
            </button>
          </div>
        </transition>

        <!-- Pre-Redemption State -->
        <transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div v-if="!redemptionSuccess">
            <!-- Staff Warning Banner -->
            <div class="px-6 pt-4 pb-3 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
              <div class="flex items-start gap-3">
                <Icon icon="mdi:account-alert" class="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-xs font-semibold text-white">Only swipe when staff is watching</p>
                  <p class="text-xs text-slate-300 mt-0.5">
                    Make sure {{ organizationName ? `${organizationName} staff` : 'staff' }} can see your screen before redeeming
                  </p>
                </div>
              </div>
            </div>

            <!-- Slider with Ambient Glow -->
            <div class="relative px-6 py-6 bg-slate-800">
              <!-- Animated glow effect -->
              <div class="absolute inset-x-6 top-1/2 -translate-y-1/2 h-20 bg-blue-500/30 blur-2xl rounded-full animate-pulse-slow"></div>
              <div class="absolute inset-x-6 top-1/2 -translate-y-1/2 h-16 bg-blue-400/20 blur-xl rounded-full"></div>
              
              <!-- Slider Component -->
              <div class="relative z-10">
                <SlideToConfirm
                  :disabled="!canRedeem"
                  :loading="isRedeeming"
                  label="Slide to redeem"
                  confirm-label="Keep sliding to confirm"
                  success-label="Redeemed"
                  success-icon="mdi:gift-open"
                  icon="mdi:gesture-swipe-right"
                  @confirm="redeemReward"
                />
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
const redemptionSuccess = ref(false);
const redemptionTime = ref<Date | null>(null);
const timeElapsed = ref('');
let timerInterval: number | null = null;

// Computed
const membership = computed(() => store.getters['auth/currentMembership']);
const organizationName = computed(() => membership.value?.organization?.name || '');
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

const updateTimeElapsed = () => {
  if (!redemptionTime.value) return;
  
  const now = new Date();
  const diffMs = now.getTime() - redemptionTime.value.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    timeElapsed.value = `${minutes}m ${remainingSeconds}s ago`;
  } else {
    timeElapsed.value = `${seconds}s ago`;
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

    // Show success state
    redemptionSuccess.value = true;
    redemptionTime.value = new Date();
    
    // Start timer
    updateTimeElapsed();
    timerInterval = window.setInterval(updateTimeElapsed, 1000);
    
    toast('Reward redeemed successfully!', 'success');
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

onUnmounted(() => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes success-bounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  70% {
    transform: scale(0.95) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-success-bounce {
  animation: success-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes success-rotate {
  0% {
    transform: rotate(-180deg) scale(0);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

.animate-success-rotate {
  animation: success-rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slide-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out 0.3s forwards;
  opacity: 0;
}

.animate-slide-up-delay {
  animation: slide-up 0.5s ease-out 0.5s forwards;
  opacity: 0;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-delay-1 {
  animation: fade-in 0.5s ease-out 0.7s forwards;
  opacity: 0;
}

.animate-fade-in-delay-2 {
  animation: fade-in 0.5s ease-out 0.9s forwards;
  opacity: 0;
}

.animate-fade-in-delay-3 {
  animation: fade-in 0.5s ease-out 1.1s forwards;
  opacity: 0;
}
</style>
