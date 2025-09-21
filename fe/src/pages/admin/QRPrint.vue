<template>
  <div class="min-h-screen bg-white p-8">
    <div class="max-w-3xl mx-auto">
      <!-- Print Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Member Portal QR Code</h1>
        <p class="text-gray-600">Scan this code to access your rewards portal</p>
      </div>

      <!-- QR Code -->
      <div class="flex justify-center mb-8">
        <div class="p-6 bg-white border-2 border-gray-200 rounded-lg">
          <img :src="qrCodeUrl" alt="Member Portal QR Code" class="w-96 h-96" />
        </div>
      </div>

      <!-- Portal URL -->
      <div class="text-center">
        <p class="text-lg text-gray-900 font-medium mb-2">Portal URL:</p>
        <p class="text-gray-600">{{ portalUrl }}</p>
      </div>

      <!-- Print Button (hidden in print) -->
      <div class="mt-8 flex justify-center print:hidden">
        <button @click="print" class="btn btn-primary">
          Print QR Code
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const portalUrl = computed(() => route.query.url || '');

const qrCodeUrl = computed(() => {
  const url = encodeURIComponent(portalUrl.value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${url}`;
});

const print = () => {
  window.print();
};
</script>

<style>
@media print {
  @page {
    size: auto;
    margin: 20mm;
  }
}
</style>
