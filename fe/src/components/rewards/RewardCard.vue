<template>
  <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <div class="flex items-center p-4 space-x-4">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <component 
          :is="rewardIcon" 
          class="w-12 h-12 text-amber-600 bg-amber-50 rounded-full p-2"
          aria-hidden="true" 
        />
      </div>

      <!-- Content -->
      <div class="flex-grow min-w-0">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 truncate">{{ reward.name }}</h3>
            <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ reward.description }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Points -->
            <div class="text-right">
              <p class="text-lg font-bold text-amber-600">{{ reward.pointsCost }}</p>
              <p class="text-xs text-gray-500">points</p>
            </div>

            <!-- Stock -->
            <div v-if="reward.quantity !== null" class="text-right">
              <p class="text-sm font-medium" :class="stockTextColor">
                {{ reward.quantity }} left
              </p>
              <p class="text-xs text-gray-500">in stock</p>
            </div>

            <!-- Toggle -->
            <div>
              <button
                type="button"
                :class="[
                  reward.isActive ? 'bg-amber-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2'
                ]"
                role="switch"
                :aria-checked="reward.isActive"
                @click="$emit('toggle', reward)"
              >
                <span
                  :class="[
                    reward.isActive ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  ]"
                >
                  <span
                    :class="[
                      reward.isActive ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                      'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    :class="[
                      reward.isActive ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                      'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Reward } from '@/types/reward';
import {
  GiftIcon,
  SparklesIcon,
  TicketIcon,
  StarIcon,
  BeakerIcon,
  CakeIcon,
  HeartIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  reward: Reward;
}>();

defineEmits<{
  (e: 'toggle', reward: Reward): void;
  (e: 'edit', reward: Reward): void;
}>();

// Compute icon based on reward type and name
const rewardIcon = computed(() => {
  const customIcons: Record<string, any> = {
    'Birthday Reward': CakeIcon,
    'VIP Experience': StarIcon,
    'Mystery Brew': BeakerIcon,
    'Loyalty Bonus': HeartIcon,
    'Achievement': TrophyIcon
  };

  if (customIcons[props.reward.name]) {
    return customIcons[props.reward.name];
  }

  switch (props.reward.type) {
    case 'product':
      return GiftIcon;
    case 'service':
      return SparklesIcon;
    case 'discount':
      return TicketIcon;
    case 'experience':
      return StarIcon;
    default:
      return GiftIcon;
  }
});

// Compute stock text color based on quantity
const stockTextColor = computed(() => {
  if (props.reward.quantity === null) return 'text-gray-500';
  if (props.reward.quantity <= 0) return 'text-red-600';
  if (props.reward.quantity < 10) return 'text-amber-600';
  return 'text-green-600';
});
</script>
