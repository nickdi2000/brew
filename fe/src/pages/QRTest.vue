<template>
  <div class="min-h-screen bg-gray-50 py-10 px-6">
    <div class="max-w-xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">QR Test</h1>
        <p class="text-gray-600">Type a value to generate a QR code below.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">QR Value</label>
            <input
              v-model.trim="qrValue"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter text or URL"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">QR Code Color</label>
            <div class="flex items-center gap-3 mt-1">
              <input
                v-model="qrColor"
                type="color"
                class="h-8 w-8 rounded border border-gray-300 cursor-pointer"
              />
              <button 
                @click="qrColor = '#000000'"
                class="text-xs text-gray-600 hover:text-gray-900"
              >
                Reset to black
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Background Color</label>
            <div class="flex items-center gap-3 mt-1">
              <input
                v-model="backgroundColor"
                type="color"
                class="h-8 w-8 rounded border border-gray-300 cursor-pointer"
              />
              <button 
                @click="backgroundColor = 'transparent'"
                class="text-xs text-gray-600 hover:text-gray-900"
              >
                Reset to transparent
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="showCodeText"
              type="checkbox"
              id="showCodeText"
              class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
            />
            <label for="showCodeText" class="text-sm font-medium text-gray-700 cursor-pointer">
              Show code text below QR
            </label>
          </div>
        </div>

        <div v-if="!qrValue" class="text-sm text-gray-500">Enter a value to see the QR code.</div>
        <div v-else>
          <div ref="qrContainer" class="flex flex-col items-center justify-center pt-4">
            <QRComponent 
              :value="qrValue" 
              :show-signature="true"
              :background-color="backgroundColor"
              :qr-color="qrColor"
            />
            <div v-if="showCodeText && extractedCode" class="font-mono text-xs text-gray-400 mt-1">
              {{ extractedCode }}
            </div>
          </div>
          <div class="flex justify-center mt-4">
            <button
              @click="downloadQR"
              class="btn btn-primary flex items-center gap-2"
              :disabled="isDownloading"
            >
              <Icon icon="mdi:download" class="h-5 w-5" />
              {{ isDownloading ? 'Downloading...' : 'Download QR Code' }}
            </button>
          </div>
        </div>
      </div>
      <div>
      Alfa, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliett, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QRComponent from '@/components/QRComponent.vue'
import html2canvas from 'html2canvas'
import { Icon } from '@iconify/vue'

const qrValue = ref('https://brewtokens.com/gold?code=123456')
const qrContainer = ref(null)
const isDownloading = ref(false)
const qrColor = ref('#000000')
const backgroundColor = ref('transparent')
const showCodeText = ref(true)

const extractedCode = computed(() => {
  try {
    const url = new URL(qrValue.value)
    const code = url.searchParams.get('code')
    return code || ''
  } catch {
    // If the value is not a valid URL, try regex matching
    const match = qrValue.value.match(/[?&]code=([^&]+)/)
    return match ? match[1] : ''
  }
})

const downloadQR = async () => {
  if (!qrContainer.value) return
  
  try {
    isDownloading.value = true
    const canvas = await html2canvas(qrContainer.value, {
      backgroundColor: null,
      scale: 2 // Higher quality
    })
    
    // Create download link
    const link = document.createElement('a')
    const fileName = extractedCode.value 
      ? `qr-code-${extractedCode.value}.png`
      : `qr-code-${Date.now()}.png`
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Failed to download QR code:', error)
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
</style>

