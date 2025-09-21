<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
    <div class="flex items-start justify-between mb-6">
      <div>
        <h4 class="text-lg font-semibold text-gray-900">Award Points QR Codes</h4>
        <p class="text-sm text-gray-600 mt-1">Create and manage QR codes that award preset points to members.</p>
      </div>
      <button 
        class="btn btn-primary flex items-center gap-2" 
        @click="$emit('create')"
      >
        <i class="fas fa-plus"></i>
        New QR Code
      </button>
    </div>

    <div v-if="loading" class="py-12">
      <div class="flex justify-center items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="text-gray-500">Loading QR codes...</span>
      </div>
    </div>

    <div v-else-if="qrCodes.length === 0" class="py-12">
      <div class="text-center">
        <div class="text-gray-400 mb-3">
          <i class="fas fa-qrcode text-4xl"></i>
        </div>
        <h3 class="text-gray-700 font-medium mb-2">No QR Codes Yet</h3>
        <p class="text-gray-500 text-sm">Create your first QR code to start awarding points.</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <div 
        v-for="qr in qrCodes" 
        :key="qr._id" 
        class="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="text-sm text-gray-500">Points Value</div>
            <div class="text-xl font-semibold text-gray-900">{{ qr.points }}</div>
          </div>
          <div class="flex items-center gap-1">
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('edit', qr)"
              title="Edit"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('print', qr)"
              title="Print"
            >
              <i class="fas fa-print"></i>
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              @click="$emit('download', qr)"
              title="Download"
            >
              <i class="fas fa-download"></i>
            </button>
            <button 
              class="p-2 text-gray-500 hover:text-red-600 transition-colors"
              @click="confirmDelete(qr)"
              title="Delete"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-xs text-gray-400 font-mono">Code: {{ qr.code }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  qrCodes: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['create', 'edit', 'print', 'download', 'delete']);

const confirmDelete = (qr) => {
  if (confirm(`Are you sure you want to delete this QR code with ${qr.points} points?`)) {
    emit('delete', qr);
  }
};
</script>
