<template>
  <aside :class="[
    isStatic ? 'h-[calc(100vh-4rem)]' : (topOffset === 'demo' ? 'h-[calc(100vh-6rem)]' : 'h-[calc(100vh-4rem)]'),
    'w-64 bg-slate-900 shadow-lg text-sm text-slate-100',
    isStatic ? '' : (topOffset === 'demo' ? 'fixed left-0 top-24 z-40' : 'fixed left-0 top-16 z-40'),
    'md:text-base',
    isStatic ? 'w-full' : ''
  ]">
    <div class="h-full px-3 py-4 overflow-y-auto" :class="isStatic ? 'px-4 py-6' : ''">
      <ul :class="isStatic ? 'space-y-3' : 'space-y-1'">
        <li v-for="item in navItems" :key="item.name">
          <router-link
            :to="{ name: item.route }"
            class="flex items-center rounded-lg transition-all duration-150"
            :class="[
              $route.name === item.route || ($route.meta.section === item.section && item.route !== 'qr-print')
                ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold'
                : 'text-slate-200 hover:bg-slate-700/70 hover:text-white',
              'transform transition-transform duration-150 border border-transparent',
              isStatic
                ? 'px-5 py-4 text-lg'
                : 'px-3 py-2 md:px-3 md:py-3'
            ]"
            @click="$emit('navigate')"
          >
            <Icon
              :icon="getIconForRoute(item.route)"
              :class="isStatic ? 'h-7 w-7 mr-4' : 'h-5 w-5 mr-3'"
            />
            <span class="font-accent font-medium">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'

const attrs = useAttrs()

const props = defineProps({
  topOffset: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'demo'].includes(value)
  }
})

const emit = defineEmits(['navigate'])

const isStatic = computed(() => attrs.class?.includes('static'))

const navItems = ref([
  { name: 'Dashboard', route: 'dashboard', section: 'Dashboard' },
  { name: 'Members', route: 'members', section: 'Members' },
  { name: 'Rewards', route: 'rewards', section: 'Rewards' },
  { name: 'QR Codes', route: 'qr-codes', section: 'QR Codes' },
  //{ name: 'Challenges & Events', route: 'challenges', section: 'Challenges & Events' },
  { name: 'Settings', route: 'settings', section: 'Settings' },
  { name: 'Guide', route: 'guide', section: 'Guide' }
])

const getIconForRoute = (route) => {
  const icons = {
    'dashboard': 'mdi:view-dashboard',
    'members': 'mdi:account-group',
    'rewards': 'mdi:gift',
    'qr-codes': 'mdi:qrcode',
   // 'challenges': 'mdi:trophy',
    'settings': 'mdi:cog',
    'guide': 'mdi:help-circle'
  }
  return icons[route] || 'mdi:circle'
}
</script>
