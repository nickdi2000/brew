<template>
  <div class="min-h-screen bg-gray-50 py-10 px-6">
    <div class="max-w-xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">QR Test</h1>
        <p class="text-gray-600">Type a value to generate a QR code below.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <label class="block text-sm font-medium text-gray-700">QR Value</label>
        <input
          v-model.trim="qrValue"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Enter text or URL"
        />

        

        <div v-if="!qrValue" class="text-sm text-gray-500">Enter a value to see the QR code.</div>
        <div v-else class="flex items-center justify-center pt-4">
          <QRComponent :value="qrValue" :show-signature="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRComponent from '@/components/QRComponent.vue'

const qrValue = ref('https://example.com')
// Defaults are now: signature shown, full opacity, no quiet zone
</script>

<style scoped>
</style>


