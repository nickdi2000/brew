<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 flex items-center justify-center">
          <Icon icon="mdi:flask" class="h-7 w-7 text-amber-600 mr-2" />
          Dev Test Bench
        </h1>
        <p class="text-gray-600 mt-1">Quickly test auth and reward creation flows</p>
      </div>

      <!-- Environment and State -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Icon icon="mdi:information-outline" class="h-5 w-5 text-blue-600 mr-2" />
          Environment
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-gray-500">API URL</div>
            <div class="font-mono break-all">{{ apiUrl }}</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-gray-500">Secure Context</div>
            <div>{{ isSecure ? 'Yes' : 'No' }}</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-gray-500">Authenticated</div>
            <div :class="isAuthenticated ? 'text-green-700' : 'text-red-700'">{{ isAuthenticated ? 'Yes' : 'No' }}</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-gray-500">Organization ID</div>
            <div class="font-mono break-all">{{ currentOrganizationId || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- Demo Login -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Icon icon="mdi:login" class="h-5 w-5 text-emerald-600 mr-2" />
          Demo Login
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-700 mb-1">Organization Code</label>
            <input
              v-model="orgCode"
              type="text"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. brewery-demo"
            />
          </div>
          <div class="flex items-end">
            <button
              class="btn btn-primary px-4 py-2 rounded text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              :disabled="authLoading || !orgCode"
              @click="handleDemoLogin"
            >
              <span v-if="authLoading" class="animate-pulse">Logging in...</span>
              <span v-else>Demo Login</span>
            </button>
          </div>
        </div>
        <p v-if="authError" class="text-sm text-red-600 mt-3">{{ authError }}</p>
      </div>

      <!-- Create Reward -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Icon icon="mdi:gift" class="h-5 w-5 text-pink-600 mr-2" />
          Create Reward
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Name</label>
            <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" placeholder="Free Pint" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Type</label>
            <select v-model="form.type" class="w-full border rounded px-3 py-2">
              <option value="product">product</option>
              <option value="service">service</option>
              <option value="discount">discount</option>
              <option value="experience">experience</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Points Cost</label>
            <input v-model.number="form.pointsCost" type="number" min="0" class="w-full border rounded px-3 py-2" placeholder="50" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Quantity (optional)</label>
            <input v-model.number="form.quantity" type="number" min="0" class="w-full border rounded px-3 py-2" placeholder="10" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full border rounded px-3 py-2" placeholder="One free pint on tap"></textarea>
          </div>
          <div>
            <label class="inline-flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" v-model="form.isActive" class="rounded" />
              <span>Active</span>
            </label>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Expires At (optional)</label>
            <input v-model="form.expiresAt" type="date" class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div class="mt-4 flex items-center space-x-3">
          <button
            class="btn btn-primary px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            :disabled="createLoading || !canSubmit"
            @click="handleCreateReward"
          >
            <span v-if="createLoading" class="animate-pulse">Creating...</span>
            <span v-else>Create Reward</span>
          </button>
          <button class="btn btn-secondary px-4 py-2 rounded border" @click="resetForm">Reset</button>
        </div>
        <p v-if="createError" class="text-sm text-red-600 mt-3">{{ createError }}</p>
        <p v-if="createSuccess" class="text-sm text-green-700 mt-3">Created reward: <span class="font-mono">{{ createSuccess }}</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useStore } from 'vuex'
import { useToast } from '@/plugins/toast'
import api, { demoLogin } from '@/api'
import { rewardsApi } from '@/api/rewards'

const store = useStore()
const toast = useToast()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3391/api'
const isSecure = window.isSecureContext

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const currentOrganizationId = computed(() => store.getters['organization/currentOrganizationId'])
const orgCode = ref('')

const authLoading = ref(false)
const authError = ref('')

const form = reactive({
  name: '',
  description: '',
  pointsCost: 0,
  type: 'product',
  isActive: true,
  quantity: null,
  expiresAt: ''
})

const createLoading = ref(false)
const createError = ref('')
const createSuccess = ref('')

const canSubmit = computed(() => {
  return !!form.name && form.pointsCost > 0 && !!form.type && isAuthenticated.value && !!currentOrganizationId.value
})

const handleDemoLogin = async () => {
  authError.value = ''
  createSuccess.value = ''
  if (!orgCode.value) {
    authError.value = 'Organization code is required'
    return
  }
  try {
    authLoading.value = true
    const resp = await demoLogin(orgCode.value)
    const { token, user } = resp.data.data
    store.commit('SET_TOKEN', token)
    store.commit('SET_USER', user)
    await store.dispatch('organization/initializeStore')
    toast('Demo login successful', 'success')
  } catch (e) {
    authError.value = e?.response?.data?.message || 'Login failed'
    toast(authError.value, 'error')
  } finally {
    authLoading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.pointsCost = 0
  form.type = 'product'
  form.isActive = true
  form.quantity = null
  form.expiresAt = ''
  createError.value = ''
  createSuccess.value = ''
}

const handleCreateReward = async () => {
  createError.value = ''
  createSuccess.value = ''
  if (!canSubmit.value) {
    createError.value = 'Please fill required fields and ensure you are logged in.'
    return
  }
  try {
    createLoading.value = true
    const payload = {
      name: form.name,
      description: form.description,
      pointsCost: Number(form.pointsCost),
      type: form.type,
      isActive: !!form.isActive,
      quantity: form.quantity !== null && form.quantity !== '' ? Number(form.quantity) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
    }
    const reward = await rewardsApi.createReward(payload)
    createSuccess.value = reward._id
    toast('Reward created', 'success')
  } catch (e) {
    createError.value = e?.response?.data?.message || 'Failed to create reward'
    toast(createError.value, 'error')
  } finally {
    createLoading.value = false
  }
}
</script>
