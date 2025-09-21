<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h4 class="text-lg font-semibold text-gray-900">Login / Registration QR Code</h4>
        <p class="text-sm text-gray-600 mt-1">Members can scan this QR code to login or register into your portal.</p>
      </div>
      <div class="flex gap-2">
        <button 
          class="btn btn-secondary flex items-center gap-2 text-sm" 
          @click="printQR"
        >
          <i class="fas fa-print"></i>
          Print
        </button>
        <button 
          class="btn btn-primary flex items-center gap-2 text-sm" 
          @click="downloadQR"
        >
          <i class="fas fa-download"></i>
          Download
        </button>
      </div>
    </div>

    <div class="flex items-start gap-6">
      <div class="relative group">
        <div class="bg-white p-4 rounded-lg border border-gray-200 transition-all duration-200 group-hover:shadow-md">
          <img 
            src="/images/qr-code.png" 
            alt="Portal QR" 
            class="w-40 h-40 object-contain"
          />
        </div>
        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
      </div>
      
      <div class="flex-1">
        <h5 class="text-sm font-medium text-gray-700 mb-2">QR Code Details</h5>
        <div class="space-y-2 text-sm text-gray-600">
          <p>• Scan to access the member portal</p>
          <p>• Works for both new and existing members</p>
          <p>• Available 24/7 for easy access</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['print', 'download']);

const printQR = () => {
  emit('print');
};

const downloadQR = () => {
  emit('download');
};
</script>
