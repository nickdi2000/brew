<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading your portal...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">Unable to load member portal.</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="px-6 py-8 max-w-md mx-auto">
      <!-- Welcome Header -->
      <div class="text-center mb-8 animate-fade-in-up">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ organization?.name }}</h1>
        <p class="text-gray-600 text-lg">Welcome back, {{ currentUser?.firstName }}!</p>
      </div>

      <!-- Balance Card - Main Focus -->
      <div class="relative mb-8 animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div class="text-center">
            <div class="text-6xl font-bold text-gray-900 mb-2 animate-count-up">
              {{ membership?.points ?? 0 }}
            </div>
            <p class="text-gray-600 text-lg">Points Available</p>
          </div>
        </div>
      </div>

      <!-- View Rewards Button -->
      <div class="animate-fade-in-up" style="animation-delay: 0.4s">
        <button 
          @click="viewRewards"
          class="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="bg-amber-50 rounded-lg p-3">
                <Icon icon="mdi:trophy" class="h-6 w-6 text-amber-600" />
              </div>
              <div class="text-left">
                <h3 class="text-lg font-semibold text-gray-900">View Rewards</h3>
                <p class="text-sm text-gray-600">Explore available rewards</p>
              </div>
            </div>
            <Icon icon="mdi:arrow-right" class="h-6 w-6 text-gray-400" />
          </div>
        </button>
      </div>

      <!-- Recent Activity Preview -->
      <div class="mt-8 animate-fade-in-up" style="animation-delay: 0.6s">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:clock-outline" class="h-5 w-5 text-gray-500 mr-2" />
            Recent Activity
          </h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="bg-amber-50 rounded-full p-2">
                <Icon icon="mdi:plus" class="h-4 w-4 text-amber-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Points earned</p>
                <p class="text-xs text-gray-600">Visit to {{ organization?.name }}</p>
              </div>
              <span class="text-sm font-semibold text-amber-600">+50</span>
            </div>
            <div class="text-center py-2">
              <button class="text-sm text-amber-600 font-medium">View all activity</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import { getOrganizationByCode } from '@/api/organization';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const error = ref(false);
const organization = ref(null);
const currentUser = computed(() => store.getters.currentUser);
const membership = computed(() => store.getters['auth/currentMembership']);

const code = computed(() => String(route.params.code || ''));

const fetchOrganization = async () => {
  try {
    const response = await getOrganizationByCode(code.value);
    organization.value = response.data?.data;
  } catch (err) {
    error.value = true;
    toast('Failed to load brewery information', 'error');
  }
};

const viewRewards = () => {
  router.push(`/members/${code.value}/rewards`);
};

onMounted(async () => {
  try {
    // Require auth + membership; otherwise, go back to login/welcome
    const isAuthenticated = store.getters.isAuthenticated;
    if (!isAuthenticated) {
      router.replace(`/members/${code.value}`);
      return;
    }
    if (!membership.value) {
      // Try to load membership by code
      try {
        const { default: api } = await import('@/api');
        const resp = await api.get(`/memberships/by-code/${code.value}`);
        const m = resp.data?.data || null;
        if (m) {
          store.commit('auth/SET_MEMBERSHIP', m);
        } else {
          router.replace(`/members/${code.value}`);
          return;
        }
      } catch {
        router.replace(`/members/${code.value}`);
        return;
      }
    }

    await fetchOrganization();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Base animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.animate-count-up {
  animation: countUp 1.5s ease-out forwards;
}

/* Base animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes countUp {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .animate-fade-in-up {
    animation-delay: 0.1s !important;
  }
}

/* Custom scrollbar for activity section */
.space-y-3::-webkit-scrollbar {
  width: 4px;
}

.space-y-3::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}
</style>


