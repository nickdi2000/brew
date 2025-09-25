<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">QR Code Management</h1>
        <div class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</div>
      </div>
      
      <div class="flex">
        <!-- Vertical Tabs -->
        <div class="w-64 flex-shrink-0 border-r border-gray-200 pr-4">
          <nav class="space-y-1" aria-label="QR Code Types">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'bg-amber-50 border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'flex items-center w-full px-3 py-2 text-sm font-medium border-l-4 group'
              ]"
            >
              <Icon 
                :icon="tab.icon"
                :class="[
                  activeTab === tab.id ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6'
                ]"
                aria-hidden="true" 
              />
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Content Area -->
        <div class="flex-1 pl-6">
          <!-- Portal QR Content -->
          <div v-if="activeTab === 'portal'" class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Portal Access</h3>
                <p class="text-gray-600 text-sm mb-4">This public QR code serves as your brewery's universal access point. Members can use it to log in to their accounts, and new customers can scan it to register - making it perfect for display at your venue.</p>
              </div>
              <div v-if="organization?.code" class="flex gap-2">
                <button class="btn btn-secondary text-sm" @click="printPortalQR">Print</button>
                <button class="btn btn-primary text-sm" @click="downloadPortalQR">Download</button>
              </div>
            </div>

            <!-- QR Code and URL Management -->
            <div class="border-t border-gray-100 pt-4">
              <div v-if="!organization?.code" class="flex flex-col items-center gap-4 py-8">
                <Icon icon="mdi:qrcode-off" class="h-16 w-16 text-gray-300" />
                <div class="text-center max-w-sm">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">No Portal URL Set</h3>
                  <p class="text-gray-600 mb-4">
                    You need to set up your organization code in Settings to generate your portal QR code.
                  </p>
                  <router-link 
                    :to="{ name: 'settings' }" 
                    class="btn btn-primary"
                  >
                    Go to Settings
                  </router-link>
                </div>
              </div>

              <div v-else class="flex flex-col items-center gap-6">
                <!-- QR Code -->
                <div class="w-64 h-64 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center bg-white overflow-hidden">
                  <vue-qrcode 
                    :value="memberPortalUrl" 
                    :options="{ width: 256 }" 
                    tag="img" 
                    class="w-full h-full portal-qr-code" 
                  />
                </div>

                <!-- URL Display -->
                <div class="text-center">
                  <p class="text-sm font-medium text-gray-700 mb-1">Your Portal URL:</p>
                  <div class="flex items-center justify-center gap-2">
                    <a 
                      :href="memberPortalUrl" 
                      target="_blank" 
                      class="text-amber-600 hover:text-amber-700 font-mono"
                    >
                      {{ memberPortalUrl }}
                    </a>
                    <router-link 
                      :to="{ name: 'settings' }" 
                      class="text-gray-400 hover:text-gray-500"
                      title="Edit in Settings"
                    >
                      <Icon icon="mdi:pencil" class="h-4 w-4" />
                    </router-link>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  <button class="btn btn-secondary text-sm" @click="printPortalQR">
                    <Icon icon="mdi:printer" class="h-4 w-4 mr-1" />
                    Print
                  </button>
                  <button class="btn btn-secondary text-sm" @click="downloadPortalQR">
                    <Icon icon="mdi:download" class="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Award Points Content -->
          <div v-if="activeTab === 'points'" class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Award Points</h3>
                <p class="text-gray-600 text-sm mb-4">Create and manage QR codes for awarding points to members.</p>
              </div>
              <button class="btn btn-primary text-sm" @click="openDrawer(null)">New QR Code</button>
            </div>
            <div class="border-t border-gray-100 pt-4">
              <div v-if="qrLoading" class="py-6 text-center text-gray-500">Loading QR codes...</div>
              <div v-else-if="awardQRCodes.length === 0" class="py-6 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <Icon icon="mdi:qrcode" class="h-12 w-12 text-gray-400" />
                <p>No QR codes created yet. Click "New QR Code" to create one.</p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                <div 
                  v-for="qr in awardQRCodes" 
                  :key="qr._id" 
                  class="relative group bg-white rounded-lg border border-gray-200 hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  @click="openDrawer(qr)"
                >
                  <!-- Status Badge -->
                  <div 
                    class="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
                    :class="qr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ qr.isActive ? 'Active' : 'Inactive' }}
                  </div>

                  <!-- Content -->
                  <div class="p-4">
                    <div class="flex items-center justify-center mb-4">
                      <Icon icon="mdi:qrcode" class="h-12 w-12 text-amber-600" />
                    </div>
                    <div class="text-center">
                      <h3 class="text-xl font-bold text-gray-900">{{ qr.points }}</h3>
                      <p class="text-sm text-gray-500">Points</p>
                    </div>
                  </div>

                  <!-- Action Bar -->
                  <div class="border-t border-gray-100 bg-gray-50 p-2 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      class="p-2 text-gray-500 hover:text-amber-600 rounded-full hover:bg-white"
                      @click.stop="printQRCode(qr)"
                      title="Print QR Code"
                    >
                      <Icon icon="mdi:printer" class="h-5 w-5" />
                    </button>
                    <button 
                      class="p-2 text-gray-500 hover:text-amber-600 rounded-full hover:bg-white"
                      @click.stop="downloadQRCode(qr)"
                      title="Download QR Code"
                    >
                      <Icon icon="mdi:download" class="h-5 w-5" />
                    </button>
                    <button 
                      class="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-white"
                      @click.stop="deleteQRCodeItem(qr)"
                      title="Delete QR Code"
                    >
                      <Icon icon="mdi:delete" class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  
    <!-- Award QR Drawer -->
    <award-q-r-drawer
      :is-open="isDrawerOpen"
      :qr-code="selectedQRCode || undefined"
      @close="closeDrawer"
      @save="saveQRCode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { qrCodesApi } from '../../api/qrCodes';
import type { QRCode } from '../../types/qrCode';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import AwardQRDrawer from '../../components/rewards/AwardQRDrawer.vue';
import { Icon } from '@iconify/vue';
import { useToast } from '../../plugins/toast';
import { Store, useStore } from 'vuex';

const toast = useToast();
const store = useStore();

// Helper functions for toast messages
const showError = (message: string) => toast(message, 'error');
const showSuccess = (message: string) => toast(message, 'success');

const qrLoading = ref(false);
const awardQRCodes = ref<QRCode[]>([]);
const lastUpdatedTime = ref(new Date());
const isDrawerOpen = ref(false);
const selectedQRCode = ref<QRCode | null>(null);
const activeTab = ref('portal');

// Get organization from Vuex store
const organization = computed(() => store.getters['organization/config']);

const tabs = [
  {
    id: 'portal',
    name: 'Portal Access',
    icon: 'mdi:door'
  },
  {
    id: 'points',
    name: 'Award Points',
    icon: 'mdi:gift'
  }
];

const lastUpdated = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(lastUpdatedTime.value);
});

const memberPortalUrl = computed(() => {
  const code = store.getters['organization/organizationCode'];
  return code ? `${window.location.origin}/members/${code}` : '';
});

// Watch for organization code changes
watch(
  () => store.getters['organization/organizationCode'],
  () => {
    lastUpdatedTime.value = new Date();
  }
);

const fetchAwardQRCodes = async () => {
  qrLoading.value = true;
  try {
    const data = await qrCodesApi.getQRCodes();
    awardQRCodes.value = data;
    lastUpdatedTime.value = new Date();
  } catch (error) {
    console.error('Failed to fetch QR codes:', error);
    showError('Failed to load QR codes');
  } finally {
    qrLoading.value = false;
  }
};

onMounted(() => {
  fetchAwardQRCodes();
});

const openDrawer = (qr: QRCode | null) => {
  selectedQRCode.value = qr;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
  selectedQRCode.value = null;
};

const saveQRCode = async (data: { points: number; isActive: boolean; _id?: string }) => {
  try {
    if (data._id) {
      const updatedQR = await qrCodesApi.updateQRCode(data._id, data);
      const index = awardQRCodes.value.findIndex(x => x._id === data._id);
      if (index !== -1) awardQRCodes.value[index] = updatedQR;
    } else {
      const newQR = await qrCodesApi.createQRCode(data);
      awardQRCodes.value.unshift(newQR);
    }
    lastUpdatedTime.value = new Date();
    showSuccess('QR code saved successfully');
    closeDrawer();
  } catch (e) {
    console.error('Failed to save QR code:', e);
    showError('Failed to save QR code');
  }
};

const deleteQRCodeItem = async (qr: QRCode) => {
  if (!confirm('Are you sure you want to delete this QR code?')) return;
  
  try {
    await qrCodesApi.deleteQRCode(qr._id);
    awardQRCodes.value = awardQRCodes.value.filter(x => x._id !== qr._id);
    lastUpdatedTime.value = new Date();
    showSuccess('QR code deleted successfully');
  } catch (e) {
    console.error('Failed to delete QR code:', e);
    showError('Failed to delete QR code');
  }
};


const printPortalQR = () => {
  window.open('/admin/qr-print?url=' + encodeURIComponent(memberPortalUrl.value), '_blank');
};

const downloadPortalQR = async () => {
  const dataUrl = await generateQRCodeDataUrl();
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'portal-qr.png';
  link.click();
};

const printQRCode = (qr: QRCode) => {
  window.open('/admin/qr-print?url=' + encodeURIComponent('POINTS:' + qr.points + ':' + qr.code), '_blank');
};

const downloadQRCode = (qr: QRCode) => {
  const link = document.createElement('a');
  link.href = '/images/qr-code.png';
  link.download = `qr-${qr.points}.png`;
  link.click();
};

const generateQRCodeDataUrl = () => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const img = document.querySelector('.portal-qr-code') as HTMLImageElement;
      resolve(img?.src || '/images/qr-code.png');
    }, 100);
  });
};
</script>

<style scoped>
.portal-qr-code {
  width: 100%;
  height: 100%;
}
</style>
