<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
    :class="{ 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-200': clickable }"
    @click="handleClick"
  >
    <div class="flex items-center justify-between gap-3">
      <div :class="iconWrapperClass">
        <Icon :icon="icon" class="h-5 w-5 sm:h-6 sm:w-6" :class="iconColorClass" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-gray-500 text-xs sm:text-sm font-medium truncate">{{ label }}</h3>
      </div>
      <div class="text-right min-w-[4rem]">
        <template v-if="showError">
          <p class="text-xs sm:text-sm font-medium text-red-500">{{ error }}</p>
        </template>
        <template v-else-if="loading">
          <div class="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
        </template>
        <template v-else>
          <p class="text-xl sm:text-3xl font-semibold text-gray-900">{{ formattedValue }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi:chart-line'
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  iconColor: {
    type: String,
    default: 'text-amber-500'
  },
  iconBackground: {
    type: String,
    default: 'bg-amber-50'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const formattedValue = computed(() => {
  if (props.loading || props.error) {
    return '—'
  }

  const numericValue = Number(props.value)
  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat('en-US').format(numericValue)
  }

  return props.value || '—'
})

const iconWrapperClass = computed(() => [
  'p-2 rounded-full flex items-center justify-center shrink-0',
  props.iconBackground || 'bg-amber-50'
])

const iconColorClass = computed(() => props.iconColor || 'text-amber-500')

const showError = computed(() => !props.loading && Boolean(props.error))

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

