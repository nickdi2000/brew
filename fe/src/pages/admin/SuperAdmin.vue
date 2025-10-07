<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Super Admin</h1>
    <p class="text-gray-600 mb-6">Restricted tools. Enter passcode to proceed.</p>

    <div v-if="!isUnlocked" class="space-y-4 max-w-sm">
      <label class="block text-sm font-medium text-gray-700">Passcode</label>
      <input
        v-model="passcode"
        type="password"
        class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
        placeholder="Enter passcode"
        @keyup.enter="unlock"
      />
      <div class="flex items-center gap-3">
        <button class="btn btn-primary" @click="unlock">Unlock</button>
        <button v-if="hasStoredUnlock" class="btn btn-secondary" @click="clearUnlock">Clear saved access</button>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <div class="rounded-lg border p-4">
        <h2 class="text-lg font-semibold mb-2">Super Admin Portal</h2>
        <p class="text-gray-600">Boilerplate area for advanced operations.</p>
      </div>
      <button class="btn btn-secondary" @click="clearUnlock">Lock</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/plugins/toast'

const PASSCODE = 'coolbrew'
const STORAGE_KEY = 'isSuperAdmin'

const passcode = ref('')
const isUnlocked = ref(false)
const error = ref('')
const toast = useToast()

const hasStoredUnlock = ref(false)

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    isUnlocked.value = stored === 'true'
    hasStoredUnlock.value = isUnlocked.value
  } catch {}
})

const unlock = () => {
  error.value = ''
  if (passcode.value.trim() !== PASSCODE) {
    error.value = 'Incorrect passcode.'
    toast('Incorrect passcode.', 'error')
    return
  }
  isUnlocked.value = true
  hasStoredUnlock.value = true
  try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
  toast('Super admin unlocked', 'success')
}

const clearUnlock = () => {
  isUnlocked.value = false
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
  toast('Super admin locked', 'success')
}
</script>

<style scoped>
</style>


