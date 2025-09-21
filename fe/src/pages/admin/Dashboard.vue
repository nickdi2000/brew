<template>
  <div>
    <TabView 
      :tabs="dashboardTabs"
      :initial-tab="dashboardTabs[0]?.tab_name"
    >
      <template #default="{ activeTab }">
        <component :is="getComponentForTab(activeTab)" />
      </template>
    </TabView>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TabView from '../../components/TabView.vue'
import Overview from './dashboard/Overview.vue'
import KeyMetrics from './dashboard/KeyMetrics.vue'
import RecentActivity from './dashboard/RecentActivity.vue'
import adminNav from '../../layouts/admin_nav.json'

const dashboardTabs = computed(() => adminNav.Dashboard || [])

const tabComponents = {
  'Overview': Overview,
  'Key Metrics': KeyMetrics,
  'Recent Activity': RecentActivity
}

const getComponentForTab = (tabName) => {
  return tabComponents[tabName] || null
}
</script>