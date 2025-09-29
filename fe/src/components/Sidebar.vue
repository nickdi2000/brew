<template>
  <aside :class="[
    'h-[calc(100vh-4rem)] w-64 bg-slate-800 shadow-lg',
    $attrs.class?.includes('static') ? '' : 'fixed left-0 top-16 z-40'
  ]">
    <div class="h-full px-3 py-4 overflow-y-auto">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.name">
          <router-link
            :to="{ name: item.route }"
            class="flex items-center p-3 rounded-lg transition-all duration-150"
            :class="[
              $route.name === item.route || ($route.meta.section === item.section && item.route !== 'qr-print')
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
              'transform transition-transform duration-150'
            ]"
          >
            <Icon :icon="getIconForRoute(item.route)" class="h-5 w-5 mr-3" />
            <span class="font-accent">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useAttrs } from 'vue'

const attrs = useAttrs()

const navItems = ref([
  { name: 'Dashboard', route: 'dashboard', section: 'Dashboard' },
  { name: 'Members', route: 'members', section: 'Members' },
  { name: 'Rewards', route: 'rewards', section: 'Rewards' },
  { name: 'QR Codes', route: 'qr-codes', section: 'QR Codes' },
  { name: 'Challenges & Events', route: 'challenges', section: 'Challenges & Events' },
  { name: 'Analytics', route: 'analytics', section: 'Analytics' },
  { name: 'Settings', route: 'settings', section: 'Settings' }
])

const getIconForRoute = (route) => {
  const icons = {
    'dashboard': 'mdi:view-dashboard',
    'members': 'mdi:account-group',
    'rewards': 'mdi:gift',
    'qr-codes': 'mdi:qrcode',
    'challenges': 'mdi:trophy',
    'analytics': 'mdi:chart-bar',
    'settings': 'mdi:cog'
  }
  return icons[route] || 'mdi:circle'
}
</script>
