<template>
  <div
    class="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer h-full"
    @click="$emit('edit', reward)"
  >
    <div class="flex flex-col sm:flex-row h-full">
      <div class="sm:w-40 md:w-48 lg:w-56 flex-shrink-0">
        <template v-if="reward.base64Image">
          <img :src="reward.base64Image" class="h-40 sm:h-full w-full object-cover object-center" :alt="reward.name" />
        </template>
        <div v-else class="h-40 sm:h-full w-full flex items-center justify-center bg-amber-50">
          <Icon :icon="rewardIcon" class="h-16 w-16 text-amber-600" aria-hidden="true" />
        </div>
      </div>
      <div class="flex-1 p-4 flex flex-col gap-3 justify-between">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="reward.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'"
            >
              <Icon :icon="reward.isActive ? 'mdi:check-circle' : 'mdi:pause-circle'" class="h-3.5 w-3.5" />
              {{ reward.isActive ? 'Active' : 'Inactive' }}
            </span>
            <h3 class="mt-2 text-lg font-semibold text-gray-900 truncate">{{ reward.name }}</h3>
            <p class="mt-1 text-sm text-gray-500 line-clamp-2">{{ reward.description }}</p>
          </div>
          <div class="flex flex-col items-end gap-2 text-right">
            <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              <Icon icon="mdi:ticket" class="h-4 w-4" /> {{ reward.pointsCost }} pts
            </span>
            <Icon icon="mdi:chevron-right" class="hidden sm:block h-5 w-5 text-gray-300 group-hover:text-gray-400 transition" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span
            v-if="reward.quantity !== null"
            class="inline-flex items-center gap-1"
          >
            <Icon icon="mdi:warehouse" class="h-3.5 w-3.5" />
            {{ reward.quantity > 0 ? `${reward.quantity} in stock` : 'Unlimited stock' }}
          </span>
          <span
            v-if="reward.expiresAt"
            class="inline-flex items-center gap-1"
          >
            <Icon icon="mdi:calendar" class="h-3.5 w-3.5" />
            Expires {{ formatDate(reward.expiresAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Reward } from '@/types/reward'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  reward: Reward;
}>()

defineEmits<{
  (e: 'edit', reward: Reward): void;
}>()

const rewardIcon = computed(() => {
  const customIcons: Record<string, string> = {
    'Birthday Reward': 'mdi:cake',
    'VIP Experience': 'mdi:star',
    'Mystery Brew': 'mdi:flask',
    'Loyalty Bonus': 'mdi:heart',
    'Achievement': 'mdi:trophy'
  }

  if (customIcons[props.reward.name]) {
    return customIcons[props.reward.name]
  }

  switch (props.reward.type) {
    case 'product':
      return 'mdi:gift'
    case 'service':
      return 'mdi:sparkles'
    case 'discount':
      return 'mdi:ticket'
    case 'experience':
      return 'mdi:star'
    default:
      return 'mdi:gift'
  }
})

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
</script>
