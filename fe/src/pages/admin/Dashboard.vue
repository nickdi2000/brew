<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="py-6">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        <TabView 
          :tabs="dashboardTabs"
          :initial-tab="dashboardTabs[0]?.tab_name"
          class="bg-white rounded-lg shadow"
        >
          <template #default="{ activeTab }">
            <component :is="getComponentForTab(activeTab)" />
          </template>
        </TabView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TabView from '../../components/TabView.vue'
import Overview from './dashboard/Overview.vue'
import Analytics from './dashboard/Analytics.vue'
import adminNav from '../../layouts/admin_nav.json'

const dashboardTabs = computed(() => adminNav.Dashboard || [])

const tabComponents = {
  Overview,
  Analytics
}

const getComponentForTab = (tabName) => {
  return tabComponents[tabName] || null
}
</script>