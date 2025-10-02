<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div class="min-w-0">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">QR Code Management</h1>
            <p class="text-gray-600 mt-1 text-sm sm:text-base">Manage your portal access and point-awarding QR codes</p>
          </div>
          <div class="text-xs sm:text-sm text-gray-500 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-200 flex-shrink-0 self-start sm:self-auto">
            Last updated: {{ lastUpdated }}
          </div>
        </div>

        <!-- Horizontal Tabs -->
        <div class="flex flex-wrap gap-0">
          <button
            v-for="tab in tabs"
            :key="tab.id"
          @click="handleTabClick(tab.id)"
            :class="[
              activeTab === tab.id
                ? 'bg-white text-gray-900 border-gray-300 border-t border-l border-r -mb-px z-20'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 border-gray-300 border-t border-l border-r border-b z-10',
              'flex items-center px-4 sm:px-6 py-3 text-sm font-medium rounded-t-lg transition-colors duration-200 relative whitespace-nowrap'
            ]"
          >
            <Icon 
              :icon="tab.icon"
              :class="[
                activeTab === tab.id ? 'text-gray-700' : 'text-gray-500',
                'mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0'
              ]"
              aria-hidden="true" 
            />
            <span class="hidden sm:inline">{{ tab.name }}</span>
            <span class="sm:hidden">{{ tab.name.split(' ')[0] }}</span>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="relative">
        <!-- Portal QR Content -->
        <div 
          v-if="activeTab === 'portal'" 
          class="bg-white border-t border-l border-r border-b border-gray-300 shadow-sm"
          style="border-radius: 0.75rem 0 0.75rem 0.75rem;"
        >
          <div class="p-4 sm:p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4">
              <div class="flex-1 min-w-0">
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Portal Access QR Code</h2>
                <p class="text-gray-600 leading-relaxed text-sm sm:text-base">
                  This public QR code serves as your brewery's universal access point. Members can use it to log in to their accounts, and new customers can scan it to register - making it perfect for display at your venue.
                </p>
              </div>
              <div v-if="organization?.code" class="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                <button 
                  class="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200" 
                  @click="printPortalQR"
                >
                  <Icon icon="mdi:printer" class="h-4 w-4 mr-2" />
                  Print
                </button>
                <button 
                  class="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors duration-200" 
                  @click="downloadPortalQR"
                >
                  <Icon icon="mdi:download" class="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            <!-- QR Code Display -->
            <div v-if="!organization?.code" class="flex flex-col items-center py-16">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icon icon="mdi:qrcode-off" class="h-10 w-10 text-gray-400" />
              </div>
              <div class="text-center max-w-md">
                <h3 class="text-lg font-medium text-gray-900 mb-3">No Portal URL Set</h3>
                <p class="text-gray-600 mb-6">
                  You need to set up your organization code in Settings to generate your portal QR code.
                </p>
                <router-link 
                  :to="{ name: 'settings' }" 
                  class="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200"
                >
                  <Icon icon="mdi:cog" class="h-4 w-4 mr-2" />
                  Go to Settings
                </router-link>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <!-- QR Code -->
              <div class="flex justify-center lg:justify-end">
                <div class="relative group">
                  <div class="w-80 h-80 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                    <vue-qrcode 
                      :value="memberPortalUrl" 
                      :options="{ width: 320 }" 
                      tag="img" 
                      class="w-full h-full portal-qr-code rounded-lg" 
                    />
                  </div>
                  <div class="absolute -top-3 -right-3 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                    Portal Access
                  </div>
                </div>
              </div>

              <!-- URL and Info -->
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Portal URL</label>
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between">
                      <a 
                        :href="memberPortalUrl" 
                        target="_blank" 
                        class="text-amber-600 hover:text-amber-700 font-mono text-sm break-all"
                      >
                        {{ memberPortalUrl }}
                      </a>
                      <router-link 
                        :to="{ name: 'settings' }" 
                        class="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Edit in Settings"
                      >
                        <Icon icon="mdi:pencil" class="h-4 w-4" />
                      </router-link>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Icon icon="mdi:check" class="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Member Login</p>
                      <p class="text-sm text-gray-600">Existing members can scan to access their account</p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <Icon icon="mdi:account-plus" class="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">New Member Registration</p>
                      <p class="text-sm text-gray-600">New customers can scan to join your loyalty program</p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <Icon icon="mdi:store" class="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Perfect for Display</p>
                      <p class="text-sm text-gray-600">Place at your venue for easy customer access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Award Points Content -->
        <div 
          v-if="activeTab === 'points'" 
          class="bg-white border-t border-l border-r border-b border-gray-300 shadow-sm"
          style="border-radius: 0 0.75rem 0.75rem 0.75rem;"
        >
          <div class="p-4 sm:p-6 lg:p-8">
            <div class="flex items-start justify-between mb-6 sm:mb-8">
              <div class="flex-1 min-w-0 pr-4">
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Point Award QR Codes</h2>
                <p class="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Create and manage QR codes that automatically award points to members when scanned.
                </p>
              </div>
              <button 
                class="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center" 
                @click="openDrawer(null)"
                title="Create New QR Code"
              >
                <Icon icon="mdi:plus" class="h-4 w-4" />
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="qrLoading" class="flex flex-col items-center py-16">
              <Icon icon="mdi:loading" class="h-8 w-8 animate-spin text-amber-600 mb-4" />
              <p class="text-gray-600">Loading QR codes...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="awardQRCodes.length === 0" class="flex flex-col items-center py-16">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icon icon="mdi:qrcode" class="h-10 w-10 text-gray-400" />
              </div>
              <div class="text-center max-w-md">
                <h3 class="text-lg font-medium text-gray-900 mb-3">No QR Codes Created Yet</h3>
                <p class="text-gray-600 mb-6">
                  Create your first point-awarding QR code to start engaging with your customers.
                </p>
                <button 
                  class="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200" 
                  @click="openDrawer(null)"
                >
                  <Icon icon="mdi:plus" class="h-5 w-5 mr-2" />
                  Create Your First QR Code
                </button>
              </div>
            </div>

            <!-- QR Codes List -->
            <div v-else class="space-y-4">
              <div 
                v-for="qr in awardQRCodes" 
                :key="qr._id" 
                class="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 cursor-pointer hover:border-amber-300 transition-colors duration-200"
                @click="openDrawer(qr)"
              >
                <div class="flex items-center justify-between">
                  <!-- Left side: QR Icon, Points, and Code -->
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:qrcode" class="h-6 w-6 text-amber-600" />
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center space-x-3 mb-1">
                        <div class="text-2xl font-bold text-gray-900">{{ qr.points }}</div>
                        <div class="text-sm text-gray-500">Points</div>
                      </div>
                      <div class="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                        {{ qr.code }}
                      </div>
                    </div>
                  </div>

                  <!-- Right side: Status and Actions -->
                  <div class="flex items-center space-x-4 flex-shrink-0">
                    <!-- Status Badge -->
                    <div 
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="qr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ qr.isActive ? 'Active' : 'Inactive' }}
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-1">
                      <button 
                        class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                        @click.stop="printQRCode(qr)"
                        title="Print QR Code"
                      >
                        <Icon icon="mdi:printer" class="h-4 w-4" />
                      </button>
                      <button 
                        class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                        @click.stop="downloadQRCode(qr)"
                        title="Download QR Code"
                      >
                        <Icon icon="mdi:download" class="h-4 w-4" />
                      </button>
                      <button 
                        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        @click.stop="deleteQRCodeItem(qr)"
                        title="Delete QR Code"
                      >
                        <Icon icon="mdi:delete" class="h-4 w-4" />
                      </button>
                    </div>
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
import { useRoute, useRouter } from 'vue-router';
import { qrCodesApi } from '../../api/qrCodes';
import type { QRCode } from '../../types/qrCode';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import AwardQRDrawer from '../../components/rewards/AwardQRDrawer.vue';
import { Icon } from '@iconify/vue';
import { useToast } from '../../plugins/toast';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
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
const activeTab = ref('points');

// Get organization from Vuex store
const organization = computed(() => store.getters['organization/config']);

const tabs = [
  {
    id: 'points',
    name: 'Award Points',
    icon: 'mdi:gift'
  },
  {
    id: 'portal',
    name: 'Portal Access',
    icon: 'mdi:door'
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

const sanitizeTabId = (tabId: string | string[] | null | undefined) => {
  if (!tabId) return null;
  const value = Array.isArray(tabId) ? tabId[0] : tabId;
  return tabs.some(tab => tab.id === value) ? value : null;
};

const setActiveTab = (tabId: string) => {
  if (tabId === activeTab.value) return;
  activeTab.value = tabId;
};

const handleTabClick = (tabId: string) => {
  setActiveTab(tabId);
};

watch(
  () => route.query.tab,
  newTab => {
    const tabFromRoute = sanitizeTabId(newTab);
    if (tabFromRoute) {
      setActiveTab(tabFromRoute);
    } else if (newTab !== undefined && newTab !== null) {
      router.replace({
        query: {
          ...route.query,
          tab: 'points'
        }
      });
    }
  },
  { immediate: true }
);

watch(
  activeTab,
  newTab => {
    if (route.query.tab === newTab) return;
    router.replace({
      query: {
        ...route.query,
        tab: newTab
      }
    });
  },
  { immediate: true }
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

const saveQRCode = async (data: { points: number; isActive: boolean; code?: string; _id?: string }) => {
  try {
    if (data._id) {
      const updatedQR = await qrCodesApi.updateQRCode(data._id, data);
      const index = awardQRCodes.value.findIndex(x => x._id === data._id);
      if (index !== -1) {
        awardQRCodes.value[index] = updatedQR;
        // Update selectedQRCode reference if it's the same QR being edited
        if (selectedQRCode.value?._id === data._id) {
          selectedQRCode.value = updatedQR;
        }
      }
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
