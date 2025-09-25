<template>
  <div class="min-h-screen flex flex-col bg-black">
    <div class="flex-grow flex justify-center">
      <!-- Mobile Container -->
      <div class="w-full max-w-[420px] bg-white min-h-[640px] shadow-2xl flex flex-col">
        <!-- Top Nav -->
        <nav v-if="currentUser" class="bg-gray-900 text-white border-b border-gray-800">
          <div class="px-4 py-3 flex items-center justify-between">
            <!-- Left: Menu Button -->
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Open menu"
              @click="showMenu = true"
            >
              <Icon icon="mdi:menu" class="h-6 w-6" />
            </button>

            <!-- Center: User & Points -->
            <div class="flex items-center space-x-3">
          
              <div v-if="currentMembership?.avatar" class="h-8 w-8 rounded-full overflow-hidden">
                <img 
                  :src="currentMembership.avatar" 
                  :alt="currentUser?.firstName"
                  class="h-full w-full object-cover"
                />
              </div>
              <div v-else class="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
                {{ currentUser?.firstName?.[0] || '?' }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-white">
                  {{ currentUser.firstName }} {{ currentUser.lastName }}
                </span>
                <span class="text-xs text-gray-300">
                  {{ currentMembership?.points || 0 }} points
                </span>
              </div>
            </div>
            
            <!-- Right: Points Badge -->
            <div class="flex items-center">
              <div class="bg-amber-500/20 rounded-full px-3 py-1 flex items-center">
                <Icon icon="mdi:star" class="h-4 w-4 text-amber-400 mr-1" />
                <span class="text-sm font-medium text-amber-300">
                  {{ currentMembership?.points || 0 }}
                </span>
              </div>
            </div>
          </div>
        </nav>
        <!-- Main Content -->
        <main class="flex-grow">
          <router-view />
        </main>

        <!-- Footer -->
        <footer class="bg-gray-900 w-full">
          <!-- Links -->
          <div class="py-6 px-6">
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6">
              <div class="space-y-2">
                <router-link to="/privacy-policy" class="block hover:text-amber-500 transition-colors">
                  Privacy Policy
                </router-link>
                <router-link to="/terms-of-service" class="block hover:text-amber-500 transition-colors">
                  Terms of Service
                </router-link>
              </div>
              <div class="space-y-2">
                <a href="mailto:support@brewtokens.com" class="block hover:text-amber-500 transition-colors">
                  Contact Support
                </a>
            
              </div>
            </div>

            <!-- Powered By -->
            <div class="pt-4 border-t border-gray-800">
              <a 
                href="https://brewtokens.com" 
                target="_blank" 
                class="flex items-center justify-center text-xs text-gray-500 hover:text-amber-500 transition-colors group"
              >
                <span>Powered by</span> &nbsp;
               <strong>BrewTokens</strong>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>

  <!-- Slide-out Menu -->
  <Drawer :show="showMenu" width="max-w-md" @close="showMenu = false">
    <template #header>
      <div class="flex items-center space-x-3">
        <div v-if="currentMembership?.avatar" class="h-8 w-8 rounded-full overflow-hidden">
          <img 
            :src="currentMembership.avatar" 
            :alt="currentUser?.firstName"
            class="h-full w-full object-cover"
          />
        </div>
        <div v-else class="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium">
          {{ currentUser?.firstName?.[0] || '?' }}
        </div>
        <div>
          <div class="text-sm font-medium text-gray-900">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
          <div class="text-xs text-gray-500">{{ currentUser?.email }}</div>
        </div>
      </div>
    </template>
    <template #content>
      <div class="space-y-2">
        <button
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
          @click="goToProfile"
        >
          <div class="flex items-center space-x-3">
            <Icon icon="mdi:account" class="h-5 w-5 text-gray-700" />
            <span class="text-gray-900">My Profile</span>
          </div>
          <Icon icon="mdi:chevron-right" class="h-5 w-5 text-gray-400" />
        </button>

        <button
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50"
          @click="handleLogout"
        >
          <div class="flex items-center space-x-3">
            <Icon icon="mdi:logout" class="h-5 w-5 text-red-600" />
            <span class="text-red-700">Logout</span>
          </div>
          <Icon icon="mdi:chevron-right" class="h-5 w-5 text-red-300" />
        </button>
      </div>
    </template>
  </Drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Drawer from '@/components/Drawer.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const showMenu = ref(false);
const currentUser = computed(() => store.getters.currentUser);
const currentMembership = computed(() => store.getters['auth/currentMembership']);

const goToProfile = () => {
  // For now, route to the portal root; can be replaced with a dedicated profile page
  showMenu.value = false;
  router.push({ name: 'member-portal', params: { code: route.params.code } });
};

const handleLogout = async () => {
  showMenu.value = false;
  try {
    await store.dispatch('logout', { redirect: false });
  } finally {
    router.replace({ name: 'member-home', params: { code: route.params.code } });
  }
};
</script>

