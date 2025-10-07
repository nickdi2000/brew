<template>
  <div v-if="hasError" class="min-h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
    <div class="text-center p-8">
      <div class="mb-4">
        <Icon icon="mdi:alert-circle" class="h-12 w-12 text-red-500 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p class="text-sm text-gray-500 mb-4">
        {{ errorMessage }}
      </p>
      <button 
        @click="retry" 
        class="btn btn-primary text-sm"
      >
        Try Again
      </button>
      <div v-if="showDetails" class="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 text-left">
        <pre>{{ errorDetails }}</pre>
      </div>
      <button 
        @click="showDetails = !showDetails" 
        class="mt-2 text-xs text-gray-400 hover:text-gray-600"
      >
        {{ showDetails ? 'Hide' : 'Show' }} Details
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { Icon } from '@iconify/vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetails = ref(false)

onErrorCaptured((error, instance, info) => {
  console.error('🚨 Component Error Caught:', {
    error: error.message,
    instance: instance?.$options.name || 'Unknown Component',
    info,
    stack: error.stack
  })
  
  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  errorDetails.value = `Component: ${instance?.$options.name || 'Unknown'}\nInfo: ${info}\nError: ${error.stack}`
  
  // Return false to prevent the error from propagating further
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showDetails.value = false
}
</script>