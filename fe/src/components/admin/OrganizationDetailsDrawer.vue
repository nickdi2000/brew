<template>
  <Drawer :show="props.open" width="max-w-2xl" @close="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3">
        <Icon icon="mdi:office-building" class="h-6 w-6 text-amber-600" />
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Organization Details</h3>
          <p class="text-sm text-gray-500">Statistics and information</p>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <Icon icon="mdi:loading" class="h-8 w-8 text-amber-600 animate-spin mx-auto mb-2" />
          <p class="text-sm text-gray-500">Loading organization details...</p>
        </div>
      </div>

      <div v-else-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
        <div class="flex items-start gap-3">
          <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-medium text-red-800">Error loading details</h4>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="details" class="space-y-6">
        <!-- Organization Info -->
        <div class="rounded-lg border bg-gray-50 p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:information" class="h-5 w-5 text-amber-600" />
            Basic Information
          </h4>
          <dl class="grid grid-cols-1 gap-3">
            <div>
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Name</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900">{{ details.organization.name }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Code</dt>
              <dd class="mt-1">
                <span class="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  {{ details.organization.code }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</dt>
              <dd class="mt-1 text-sm text-gray-700">{{ formatDate(details.organization.createdAt) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Statistics -->
        <div class="rounded-lg border bg-white p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-box" class="h-5 w-5 text-amber-600" />
            Statistics
          </h4>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Members Stats -->
            <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="mdi:account-group" class="h-5 w-5 text-blue-600" />
                <h5 class="text-xs font-semibold text-blue-900 uppercase tracking-wider">Members</h5>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-blue-700">Total:</span>
                  <span class="text-lg font-bold text-blue-900">{{ details.stats.members.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-blue-700">Active:</span>
                  <span class="text-sm font-semibold text-blue-800">{{ details.stats.members.active }}</span>
                </div>
              </div>
            </div>

            <!-- Rewards Stats -->
            <div class="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="mdi:gift" class="h-5 w-5 text-purple-600" />
                <h5 class="text-xs font-semibold text-purple-900 uppercase tracking-wider">Rewards</h5>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-purple-700">Total:</span>
                  <span class="text-lg font-bold text-purple-900">{{ details.stats.rewards.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-purple-700">Active:</span>
                  <span class="text-sm font-semibold text-purple-800">{{ details.stats.rewards.active }}</span>
                </div>
              </div>
            </div>

            <!-- QR Codes Stats -->
            <div class="rounded-lg bg-green-50 border border-green-200 p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="mdi:qrcode" class="h-5 w-5 text-green-600" />
                <h5 class="text-xs font-semibold text-green-900 uppercase tracking-wider">QR Codes</h5>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-green-700">Total:</span>
                  <span class="text-lg font-bold text-green-900">{{ details.stats.qrCodes.total }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-green-700">Active:</span>
                  <span class="text-sm font-semibold text-green-800">{{ details.stats.qrCodes.active }}</span>
                </div>
              </div>
            </div>

            <!-- Transactions Stats -->
            <div class="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
              <div class="flex items-center gap-2 mb-2">
                <Icon icon="mdi:swap-horizontal" class="h-5 w-5 text-indigo-600" />
                <h5 class="text-xs font-semibold text-indigo-900 uppercase tracking-wider">Transactions</h5>
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-indigo-700">Total:</span>
                  <span class="text-lg font-bold text-indigo-900">{{ details.stats.transactions.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Points Summary -->
        <div class="rounded-lg border bg-amber-50 p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:star-circle" class="h-5 w-5 text-amber-600" />
            Points Activity
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-xs font-medium text-amber-700 uppercase tracking-wider">Points Issued</dt>
              <dd class="mt-1 text-2xl font-bold text-amber-900">{{ formatNumber(details.stats.points.issued) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-amber-700 uppercase tracking-wider">Points Redeemed</dt>
              <dd class="mt-1 text-2xl font-bold text-amber-900">{{ formatNumber(details.stats.points.redeemed) }}</dd>
            </div>
          </div>
        </div>

        <!-- Admin Users -->
        <div v-if="details.admins && details.admins.length > 0" class="rounded-lg border bg-white p-4">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:shield-account" class="h-5 w-5 text-amber-600" />
            Admin Users
          </h4>
          <div class="space-y-2">
            <div
              v-for="admin in details.admins"
              :key="admin._id"
              class="flex items-center justify-between rounded-md border bg-gray-50 p-3"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ formatName(admin.firstName, admin.lastName) }}
                </p>
                <p class="text-xs text-gray-500">{{ admin.email }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Since</p>
                <p class="text-xs font-medium text-gray-700">{{ formatDate(admin.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Admins -->
        <div v-else class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div class="text-center py-4">
            <Icon icon="mdi:account-off" class="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-500">No admin users found</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <Icon icon="mdi:alert-circle-outline" class="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">No data available</p>
      </div>
    </template>
  </Drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Drawer from '@/components/Drawer.vue'
import { getSuperOrganizationDetails } from '@/api'
import { useToast } from '@/plugins/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  organizationId: {
    type: String,
    default: null
  },
  passcode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const toast = useToast()
const isLoading = ref(false)
const error = ref('')
const details = ref(null)

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatName = (first, last) => {
  const fullName = [first, last].filter(Boolean).join(' ').trim()
  return fullName || '—'
}

const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString()
}

const fetchDetails = async () => {
  if (!props.organizationId || !props.passcode) {
    return
  }

  isLoading.value = true
  error.value = ''
  details.value = null

  try {
    const response = await getSuperOrganizationDetails(props.passcode, props.organizationId)
    details.value = response.data
  } catch (err) {
    console.error('Failed to load organization details:', err)
    const message = err?.response?.data?.message || err?.message || 'Failed to load organization details'
    error.value = message
    toast(message, 'error')
  } finally {
    isLoading.value = false
  }
}

// Watch for when the drawer opens with a valid organization ID
watch(
  () => [props.open, props.organizationId],
  ([open, orgId]) => {
    if (open && orgId) {
      fetchDetails()
    } else {
      // Reset state when drawer closes
      details.value = null
      error.value = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
</style>

