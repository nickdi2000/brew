<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-end z-50" @click.self="closeDrawer">
    <div class="bg-white lg:rounded-l-lg shadow-xl w-full lg:max-w-xl h-full overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Edit QR Code' : 'New QR Code' }}</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="closeDrawer">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-6 space-y-6">
        <!-- QR Code Display -->
        <div v-if="isEditing" class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
          <div class="w-64 h-64 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
            <vue-qrcode :value="qrCodeValue" :options="{ width: 256 }" tag="img" class="w-full h-full" />
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900 mb-1">{{ formData.points }} Points</div>
            <div class="text-sm text-gray-500">Scan to award points</div>
            <div class="mt-2">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ formData.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button 
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              @click="printQRCode"
            >
              <Icon icon="mdi:printer" class="h-4 w-4 mr-2" />
              Print
            </button>
            <button 
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              @click="downloadQRCode"
            >
              <Icon icon="mdi:download" class="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
          <button 
            v-if="!showForm"
            @click="showForm = true"
            class="mt-6 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Icon icon="mdi:pencil" class="h-4 w-4 mr-2" />
            Edit Settings
          </button>
        </div>

        <!-- Form Fields -->
        <div v-if="!isEditing || showForm" class="space-y-4">
          <div>
            <label for="points" class="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input 
              id="points" 
              v-model.number="formData.points" 
              type="number" 
              min="1" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
              placeholder="Enter points value" 
            />
            <p v-if="errors.points" class="text-red-600 text-sm mt-1">{{ errors.points }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div class="flex items-center gap-4">
              <div class="flex items-center">
                <input 
                  id="active" 
                  type="radio" 
                  v-model="formData.isActive" 
                  :value="true" 
                  class="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300" 
                />
                <label for="active" class="ml-2 text-sm font-medium text-gray-700">Active</label>
              </div>
              <div class="flex items-center">
                <input 
                  id="inactive" 
                  type="radio" 
                  v-model="formData.isActive" 
                  :value="false" 
                  class="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300" 
                />
                <label for="inactive" class="ml-2 text-sm font-medium text-gray-700">Inactive</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6 border-t border-gray-200 flex justify-end gap-2">
        <button class="btn btn-secondary" @click="closeDrawer">Cancel</button>
        <button class="btn btn-primary" @click="saveQRCode" :disabled="hasErrors">{{ isEditing ? 'Update' : 'Create' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';
import VueQrcode from '@chenfengyuan/vue-qrcode';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  qrCode: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const qrCodeValue = computed(() => {
  if (!props.qrCode) return '';
  return `POINTS:${props.qrCode.points}:${props.qrCode.code}`;
});

const printQRCode = () => {
  window.open('/admin/qr-print?url=' + encodeURIComponent(qrCodeValue.value), '_blank');
};

const downloadQRCode = () => {
  const link = document.createElement('a');
  link.href = '/images/qr-code.png';
  link.download = `qr-${props.qrCode?.points || 'new'}.png`;
  link.click();
};

const isEditing = computed(() => !!props.qrCode);
const showForm = ref(false);
const formData = ref({
  points: 10,
  isActive: true
});
const errors = ref({
  points: ''
});

watch(() => props.qrCode, (newQrCode) => {
  if (newQrCode) {
    formData.value = {
      points: newQrCode.points || 1,
      isActive: newQrCode.isActive !== undefined ? newQrCode.isActive : true
    };
  } else {
    formData.value = {
      points: 1,
      isActive: true
    };
  }
}, { immediate: true });

watch(() => formData.value.points, (newPoints) => {
  if (newPoints < 1) {
    errors.value.points = 'Points must be at least 1';
  } else {
    errors.value.points = '';
  }
});

const hasErrors = computed(() => {
  return !!errors.value.points;
});

const closeDrawer = () => {
  showForm.value = false;
  emit('close');
};

const saveQRCode = () => {
  if (!hasErrors.value) {
    emit('save', { ...formData.value, _id: isEditing.value ? props.qrCode._id : undefined });
  }
};
</script>
