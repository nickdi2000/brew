<template>
  <div class="min-h-screen flex flex-col bg-black">
    <div class="flex-grow flex justify-center">
      <!-- Mobile Container -->
      <div class="w-full max-w-[420px] bg-white min-h-[640px] shadow-2xl flex flex-col">
        <!-- Top Nav -->
        <nav v-if="currentUser" class="bg-white border-b border-gray-200">
          <div class="px-4 py-3 flex items-center justify-between">
            <!-- User Profile -->
            <div class="flex items-center space-x-3">
              <img 
                :src="currentUser.picture" 
                :alt="currentUser.firstName"
                class="h-8 w-8 rounded-full object-cover"
              />
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">
                  {{ currentUser.firstName }} {{ currentUser.lastName }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ currentMembership?.points || 0 }} points
                </span>
              </div>
            </div>

            <!-- Points Badge -->
            <div class="flex items-center space-x-2">
              <div class="bg-amber-100 rounded-full px-3 py-1 flex items-center">
                <Icon icon="mdi:star" class="h-4 w-4 text-amber-600 mr-1" />
                <span class="text-sm font-medium text-amber-800">
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
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';

const store = useStore();
const currentUser = computed(() => store.state.auth.user);
const currentMembership = computed(() => store.state.auth.membership);
</script>

