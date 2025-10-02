<template>
  <div class="min-h-screen flex flex-col bg-black">
    <div class="flex-grow flex justify-center">
      <!-- Mobile Container -->
      <div class="w-full max-w-[420px] bg-white min-h-[640px] shadow-2xl flex flex-col">
        <!-- Top Nav -->
        <nav v-if="currentUser" class="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
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
              </div>
            </div>
            
            <!-- Right: Points Badge -->
            <div class="flex items-center relative">
              <!-- Celebration particles effect -->
              <div 
                v-if="pointsUpdated"
                class="absolute -top-2 -right-2 flex space-x-1"
              >
                <div class="w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>
                <div class="w-1 h-1 bg-yellow-400 rounded-full animate-ping" style="animation-delay: 0.2s"></div>
                <div class="w-1 h-1 bg-amber-300 rounded-full animate-ping" style="animation-delay: 0.4s"></div>
              </div>
              
              <div 
                class="bg-amber-500/20 rounded-full px-3 py-1 flex items-center transition-all duration-300 relative overflow-hidden"
                :class="{ 
                  'animate-pulse bg-amber-500/40 scale-110 shadow-lg shadow-amber-500/25': pointsUpdated,
                  'animate-bounce': pointsUpdated
                }"
              >
                <!-- Animated background effect during counting -->
                <div 
                  v-if="pointsUpdated"
                  class="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 animate-pulse"
                ></div>
                <Icon 
                  icon="mdi:star" 
                  class="h-4 w-4 text-amber-400 mr-1 transition-all duration-300 relative z-10"
                  :class="{ 'animate-spin': pointsUpdated }"
                />
                <span 
                  class="text-sm font-medium text-amber-300 transition-all duration-300 relative z-10"
                  :class="{ 'text-amber-200 font-bold': pointsUpdated }"
                >
                  {{ displayPoints.toLocaleString() }}
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
                <router-link to="/login" class="block hover:text-amber-500 transition-colors">
                  Admin
                </router-link>
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
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import Drawer from '@/components/Drawer.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const showMenu = ref(false);
const pointsUpdated = ref(false);
const displayPoints = ref(0);
const currentUser = computed(() => store.getters.currentUser);
const currentMembership = computed(() => store.getters['auth/currentMembership']);

// Initialize display points
if (currentMembership.value?.points) {
  displayPoints.value = currentMembership.value.points;
}

// Watch for points changes and trigger counting animation
watch(
  () => currentMembership.value?.points,
  (newPoints, oldPoints) => {
    if (newPoints !== undefined && oldPoints !== undefined && newPoints !== oldPoints) {
      pointsUpdated.value = true;
      animatePointsCount(oldPoints, newPoints);
    } else if (newPoints !== undefined && oldPoints === undefined) {
      // Initial load
      displayPoints.value = newPoints;
    }
  },
  { immediate: true }
);

// Animate points counting up
const animatePointsCount = (startValue, endValue) => {
  const duration = 1500; // 1.5 seconds
  const startTime = Date.now();
  const difference = endValue - startValue;
  
  const updateCount = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth deceleration (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (difference * easeOut));
    
    displayPoints.value = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      // Ensure we end exactly at the target value
      displayPoints.value = endValue;
      // Reset animation state after counting is complete
      setTimeout(() => {
        pointsUpdated.value = false;
      }, 500);
    }
  };
  
  requestAnimationFrame(updateCount);
};

const goToProfile = () => {
  // For now, route to the portal root; can be replaced with a dedicated profile page
  showMenu.value = false;
  router.push({ name: 'member-portal', params: { code: route.params.code } });
};

const handleLogout = async () => {
  showMenu.value = false;
  try {
    await store.dispatch('logout', { redirect: false, routeType: 'member' });
  } finally {
    router.replace({ name: 'member-home', params: { code: route.params.code } });
  }
};
</script>

