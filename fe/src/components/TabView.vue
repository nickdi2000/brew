<template>
  <div class="h-full">
    <!-- Tab Navigation -->
    <div class="border-b border-slate-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.tab_name"
          @click="activeTab = tab.tab_name"
          :class="[
            activeTab === tab.tab_name
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
            'whitespace-nowrap border-b-2 py-4 px-4 text-sm font-medium font-accent'
          ]"
        >
          {{ tab.tab_name }}
        </button>
      </nav>
    </div>

    <!-- Tab Description -->
    <div class="mt-4 text-sm text-slate-600 font-accent px-4 py-3">
      {{ activeTabDescription }}
    </div>

    <!-- Tab Content -->
    <div class="mt-2">
      <slot :active-tab="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  initialTab: {
    type: String,
    default: ''
  }
})

const activeTab = ref(props.initialTab || (props.tabs[0]?.tab_name ?? ''))

const activeTabDescription = computed(() => {
  const tab = props.tabs.find(t => t.tab_name === activeTab.value)
  return tab?.description ?? ''
})
</script>
