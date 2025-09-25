<template>
  <div 
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    @click="$emit('edit', reward)"
  >
    <div class="flex items-center p-4 space-x-4 group-hover:bg-gray-50">
      <!-- Image or Icon -->
      <div class="flex-shrink-0">
        <div v-if="reward.base64Image" class="w-12 h-12 rounded-lg overflow-hidden">
          <img :src="reward.base64Image" class="w-full h-full object-cover" :alt="reward.name" />
        </div>
        <Icon 
          v-else
          :icon="rewardIcon" 
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
                @click.stop="$emit('toggle', reward)"
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
                    <Icon icon="mdi:close" class="h-3 w-3 text-gray-400" />
                  </span>
                  <span
                    :class="[
                      reward.isActive ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                      'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                    ]"
                    aria-hidden="true"
                  >
                    <Icon icon="mdi:check" class="h-3 w-3 text-amber-600" />
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
import { Icon } from '@iconify/vue';

const props = defineProps<{
  reward: Reward;
}>();

defineEmits<{
  (e: 'toggle', reward: Reward): void;
  (e: 'edit', reward: Reward): void;
}>();

// Compute icon based on reward type and name
const rewardIcon = computed(() => {
  const customIcons: Record<string, string> = {
    'Birthday Reward': 'mdi:cake',
    'VIP Experience': 'mdi:star',
    'Mystery Brew': 'mdi:flask',
    'Loyalty Bonus': 'mdi:heart',
    'Achievement': 'mdi:trophy'
  };

  if (customIcons[props.reward.name]) {
    return customIcons[props.reward.name];
  }

  switch (props.reward.type) {
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
});

</script>
