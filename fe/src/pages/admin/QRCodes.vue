<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">QR Code Management</h1>
        <div class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Portal QR Card -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
                  <i class="fas fa-user-circle"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Portal Access</h3>
              </div>
              <p class="text-gray-600 text-sm mb-4">Generate QR codes for member login and registration access.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-secondary text-sm" @click="printPortalQR">Print</button>
              <button class="btn btn-primary text-sm" @click="downloadPortalQR">Download</button>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-4 relative group cursor-pointer" @click="isEditingPortalUrl = true">
            <div class="w-64 h-64 mx-auto rounded-lg border border-gray-200 shadow-sm flex items-center justify-center bg-white overflow-hidden">
                      <vue-qrcode :value="memberPortalUrl.value" :options="{ width: 256 }" tag="img" class="w-full h-full portal-qr-code" />
            </div>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-b-lg pt-16 flex items-center justify-center text-white invisible group-hover:visible">
              <div class="bg-black/60 px-3 py-1 rounded-md text-sm">Edit Code</div>
            </div>
          </div>
          <!-- Edit Code Modal -->
          <div v-if="isEditingPortalUrl" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="isEditingPortalUrl = false">
            <div class="bg-white rounded-lg p-6 w-96 shadow-xl" @click.stop>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Organization Code</h3>
              <div class="mb-6">
                <label for="orgCode" class="block text-sm font-medium text-gray-700 mb-1">Organization Code</label>
                <div class="relative">
                  <input 
                    id="orgCode" 
                    v-model="organizationCode" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter organization code"
                  />
                  <div class="mt-2 text-sm text-gray-500">
                    URL Preview: https://<span class="text-blue-600">{{ organizationCode || 'your-code' }}</span>.brewtokens.com
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button class="btn btn-secondary" @click="isEditingPortalUrl = false">Cancel</button>
                <button class="btn btn-primary" @click="savePortalUrl">Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Award Points Card -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
                  <i class="fas fa-gift"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Award Points</h3>
              </div>
              <p class="text-gray-600 text-sm mb-4">Create and manage QR codes for awarding points to members.</p>
            </div>
            <button class="btn btn-primary text-sm" @click="openDrawer(null)">New QR Code</button>
          </div>
          <div class="border-t border-gray-100 pt-4">
            <div v-if="qrLoading" class="py-6 text-center text-gray-500">Loading QR codes...</div>
            <div v-else-if="awardQRCodes.length === 0" class="py-6 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <i class="fas fa-qrcode text-3xl text-gray-400"></i>
              <p>No QR codes created yet. Click "New QR Code" to create one.</p>
            </div>
            <div v-else class="space-y-4 max-h-48 overflow-y-auto pr-1">
              <div v-for="qr in awardQRCodes" :key="qr._id" class="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                <div>
                  <div class="font-medium text-gray-900">{{ qr.points }} Points</div>
                  <div class="text-xs text-gray-500">Code: {{ qr.code }}</div>
                  <div class="text-xs text-gray-500">Status: {{ qr.isActive ? 'Active' : 'Inactive' }}</div>
                </div>
                <div class="flex gap-1">
                  <button class="text-xs text-blue-600 hover:text-blue-800" @click="openDrawer(qr)">Edit</button>
                  <button class="text-xs text-blue-600 hover:text-blue-800" @click="printQRCode(qr)">Print</button>
                  <button class="text-xs text-blue-600 hover:text-blue-800" @click="downloadQRCode(qr)">Download</button>
                  <button class="text-xs text-red-600 hover:text-red-800" @click="deleteQRCodeItem(qr)">Delete</button>
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
    :qr-code="selectedQRCode"
    @close="closeDrawer"
    @save="saveQRCode"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getOrganization, updateOrganization } from '../../api';
import { qrCodesApi } from '../../api/qrCodes';
import type { QRCode } from '../../types/qrCode';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { getCurrentInstance, ComponentInternalInstance } from 'vue';
import AwardQRDrawer from '../../components/rewards/AwardQRDrawer.vue';

const instance = getCurrentInstance();
if (!instance) {
  throw new Error('Component instance is not available');
}
const proxy = instance.proxy!;

const organization = ref<any>(null);
const loading = ref(false);
const qrLoading = ref(false);
const awardQRCodes = ref<QRCode[]>([]);
const lastUpdatedTime = ref(new Date());
const isEditingPortalUrl = ref(false);
const organizationCode = ref('');
const isDrawerOpen = ref(false);
const selectedQRCode = ref<QRCode | null>(null);

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
  return `https://${organizationCode.value || 'brewtokens'}.brewtokens.com`;
});

const fetchOrganization = async () => {
  loading.value = true;
  try {
    const response = await getOrganization();
    organization.value = response.data;
    lastUpdatedTime.value = new Date();
    // Initialize organization code from data if available
    if (organization.value?.code) {
      organizationCode.value = organization.value.code;
    }
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    proxy.$toast('Failed to load organization details', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchAwardQRCodes = async () => {
  qrLoading.value = true;
  try {
    const data = await qrCodesApi.getQRCodes();
    awardQRCodes.value = data;
    lastUpdatedTime.value = new Date();
  } catch (error) {
    console.error('Failed to fetch QR codes:', error);
    proxy.$toast('Failed to load QR codes', 'error');
  } finally {
    qrLoading.value = false;
  }
};

onMounted(() => {
  fetchOrganization();
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
    proxy.$toast('QR code saved successfully', 'success');
    closeDrawer();
  } catch (e) {
    console.error('Failed to save QR code:', e);
    proxy.$toast('Failed to save QR code', 'error');
  }
};

const deleteQRCodeItem = async (qr: QRCode) => {
  if (!confirm('Are you sure you want to delete this QR code?')) return;
  
  try {
    await qrCodesApi.deleteQRCode(qr._id);
    awardQRCodes.value = awardQRCodes.value.filter(x => x._id !== qr._id);
    lastUpdatedTime.value = new Date();
    proxy.$toast('QR code deleted successfully', 'success');
  } catch (e) {
    console.error('Failed to delete QR code:', e);
    proxy.$toast('Failed to delete QR code', 'error');
  }
};

const savePortalUrl = async () => {
  try {
    await updateOrganization({ code: organizationCode.value });
    if (organization.value) {
      organization.value.code = organizationCode.value;
    }
    isEditingPortalUrl.value = false;
    proxy.$toast('Organization code updated successfully', 'success');
    lastUpdatedTime.value = new Date();
  } catch (error) {
    console.error('Failed to update organization code:', error);
    proxy.$toast('Failed to update organization code', 'error');
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
