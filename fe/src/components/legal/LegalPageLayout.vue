<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-white">
    <header class="sticky top-0 z-20 border-b border-amber-100/70 bg-white/85 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-3">
          <router-link
            to="/"
            class="btn btn-secondary flex items-center gap-2 whitespace-nowrap"
            aria-label="Back to home"
          >
            <Icon icon="mdi:arrow-left" class="h-5 w-5" />
            <span class="hidden sm:inline">Back to Home</span>
            <span class="sm:hidden">Back</span>
          </router-link>

          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
              {{ title }}
            </h1>
            <p v-if="formattedLastUpdated" class="text-sm text-gray-500">
              Last updated: {{ formattedLastUpdated }}
            </p>
          </div>
        </div>

        <slot name="header-actions"></slot>
      </div>
    </header>

    <main class="py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white border border-amber-100/70 shadow-sm rounded-3xl p-6 sm:p-10">
          <slot></slot>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: [String, Date],
    default: ''
  }
})

const formattedLastUpdated = computed(() => {
  if (!props.lastUpdated) {
    return ''
  }

  if (props.lastUpdated instanceof Date) {
    return props.lastUpdated.toLocaleDateString()
  }

  return props.lastUpdated
})
</script>


