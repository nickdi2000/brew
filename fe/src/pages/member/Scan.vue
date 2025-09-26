<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading QR codes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white border-l-4 border-red-500 p-4 rounded-lg max-w-sm shadow-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-500 flex-shrink-0" />
          <p class="ml-3 text-sm text-gray-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen p-6">
      <div class="text-center mb-8">
        <Icon icon="mdi:qr-code-scanner" class="h-24 w-24 text-gray-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
        <p class="text-gray-600 mt-2">Real scanner coming soon. For now, use these test buttons:</p>
      </div>

      <!-- Development Only Section -->
      <div v-if="isDevelopment" class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:code-braces" class="h-5 w-5 mr-2 text-amber-600" />
            Development Testing
          </h2>
          
          <div v-if="qrCodes.length === 0" class="text-center py-4">
            <p class="text-gray-500">No QR codes found. Create some in the admin panel.</p>
          </div>
          
          <div v-else class="space-y-3">
            <button
              v-for="qr in qrCodes"
              :key="qr._id"
              @click="awardPoints(qr)"
              class="w-full flex items-center justify-between px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-200"
              :disabled="awarding"
            >
              <div class="flex items-center">
                <Icon icon="mdi:qr-code" class="h-5 w-5 text-amber-600 mr-2" />
                <span class="font-medium text-gray-900">{{ qr.name }}</span>
              </div>
              <span class="text-amber-600 font-semibold">+{{ qr.points }} points</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { qrCodesApi } from '@/api/qrCodes';
import { addTransaction } from '@/api/transactions';
import { useStore } from 'vuex';
import { useToast } from '@/plugins/toast';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const membership = computed(() => store.getters['auth/currentMembership']);

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const qrCodes = ref([]);
const awarding = ref(false);

const isDevelopment = computed(() => import.meta.env.MODE === 'development');

const fetchQRCodes = async () => {
  try {
    qrCodes.value = await qrCodesApi.getQRCodes();
    loading.value = false;
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Failed to load QR codes. Please try again.';
    loading.value = false;
  }
};

const awardPoints = async (qr) => {
  if (awarding.value) return;
  
  awarding.value = true;
  const membership = store.getters['auth/currentMembership'];
  
  if (!(membership?._id || membership?.id)) {
    toast('Member ID not found. Please try logging in again.', 'error');
    awarding.value = false;
    return;
  }
  const memberId = membership._id || membership.id;
  
  try {
    await addTransaction(memberId, {
      amount: qr.points,
      type: 'earn',
      metadata: {
        description: `Test QR code: ${qr.name}`,
        qrCodeId: qr._id
      }
    });
    
    toast(`Awarded ${qr.points} points!`, 'success');
  } catch (err) {
    toast('Failed to award points. Please try again.', 'error');
  } finally {
    awarding.value = false;
  }
};

onMounted(async () => {
  try {
    // Require auth + membership; otherwise, go back to login/welcome
    const isAuthenticated = store.getters.isAuthenticated;
    const code = route.params.code;
    
    if (!isAuthenticated) {
      router.replace(`/members/${code}`);
      return;
    }

    if (!membership.value) {
      // Try to load membership by code
      try {
        const { default: api } = await import('@/api');
        const resp = await api.get(`/memberships/by-code/${code}`);
        const m = resp.data?.data || null;
        if (m) {
          store.commit('auth/SET_MEMBERSHIP', m);
        } else {
          router.replace(`/members/${code}`);
          return;
        }
      } catch {
        router.replace(`/members/${code}`);
        return;
      }
    }

    await fetchQRCodes();
  } finally {
    loading.value = false;
  }
});
</script>
