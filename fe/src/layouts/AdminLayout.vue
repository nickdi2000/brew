<template>
  <div class="min-h-screen bg-gradient-subtle">
    <!-- Navigation -->
    <nav class="fixed top-0 z-50 w-full bg-slate-800 shadow-lg">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-white font-display">BrewTokens Admin</h1>
            </div>
          </div>
          <div class="flex items-center">
            <div class="ml-4 flex items-center md:ml-6">
              <div class="relative" ref="accountDropdown">
                <button
                  @click="showAccountMenu = !showAccountMenu"
                  class="flex items-center space-x-2 px-3 py-2 text-sm font-accent text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors duration-150"
                >
                  <Icon icon="mdi:account-circle" class="h-5 w-5" />
                  <span class="hidden sm:inline">Account</span>
                  <Icon :icon="showAccountMenu ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="h-4 w-4" />
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showAccountMenu"
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                >
                  <div class="py-1">
                    <router-link
                      to="/admin/profile"
                      class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-slate-50"
                      @click="showAccountMenu = false"
                    >
                      <Icon icon="mdi:account" class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      My Profile
                    </router-link>
                  </div>
                  <div class="py-1">
                    <button
                      @click="handleLogout"
                      class="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <Icon icon="mdi:logout" class="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="pt-16 pl-64">
      <div class="p-8">
        <router-view v-slot="{ Component }">
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
            mode="out-in"
          >
            <component :is="Component">
              <template #default="props">
                <TabView 
                  v-if="currentSectionTabs.length > 0"
                  :tabs="currentSectionTabs"
                  :initial-tab="currentSectionTabs[0]?.tab_name"
                >
                  <template #default="{ activeTab }">
                    <ComingSoon />
                  </template>
                </TabView>
              </template>
            </component>
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { onClickOutside } from '@vueuse/core'
import Sidebar from '../components/Sidebar.vue'
import TabView from '../components/TabView.vue'
import ComingSoon from '../components/ComingSoon.vue'
import adminNav from './admin_nav.json'

const store = useStore()
const router = useRouter()
const route = useRoute()
const showAccountMenu = ref(false)
const accountDropdown = ref(null)

// Setup click outside handler
onClickOutside(accountDropdown, () => {
  showAccountMenu.value = false
})

const handleLogout = () => {
  store.dispatch('logout')
  router.push('/login')
}

const currentSectionTabs = computed(() => {
  const currentSection = route.name?.charAt(0).toUpperCase() + route.name?.slice(1)
  return adminNav[currentSection] || []
})
</script>

<style scoped>
.animate-fade-out {
  animation: fadeOut 0.2s ease-in-out;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>