<template>
  <div class="min-h-screen">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading your portal...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg max-w-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-400 flex-shrink-0" />
          <p class="ml-3 text-sm text-red-700">Unable to load member portal.</p>
        </div>
      </div>
    </div>

    <div v-else class="px-6 py-8 max-w-md mx-auto">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{{ organization?.name }}</h1>
        <p class="text-gray-600">Welcome back, {{ currentUser?.firstName }}.</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-xl shadow p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="bg-amber-100 rounded-lg p-2">
                <Icon icon="mdi:star-circle" class="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div class="text-sm text-gray-500">Your points</div>
                <div class="text-xl font-semibold">{{ membership?.points ?? 0 }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-400">Status: <span class="capitalize">{{ membership?.status || 'active' }}</span></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-5">
          <div class="flex items-center space-x-3">
            <div class="bg-sky-100 rounded-lg p-2">
              <Icon icon="mdi:trophy" class="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <div class="text-sm text-gray-500">Rewards</div>
              <div class="text-gray-900 font-medium">Coming soon</div>
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
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>


