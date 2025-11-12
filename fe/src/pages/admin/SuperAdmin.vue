<template>
  <div class="max-w-7xl w-full mx-auto px-4">
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
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex gap-6" aria-label="Tabs">
          <button
            @click="activeTab = 'organizations'"
            :class="[
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors',
              activeTab === 'organizations'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            ]"
          >
            <Icon icon="mdi:office-building" class="inline-block h-5 w-5 mr-2" />
            Organizations
          </button>
          <button
            @click="activeTab = 'qrcodes'"
            :class="[
              'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors',
              activeTab === 'qrcodes'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            ]"
          >
            <Icon icon="mdi:qrcode" class="inline-block h-5 w-5 mr-2" />
            Preprinted QR Codes
          </button>
        </nav>
      </div>

      <!-- Organizations Tab -->
      <div v-show="activeTab === 'organizations'" class="rounded-lg border p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Organizations</h2>
            <p class="text-gray-600">Review organizations and their primary admin contacts.</p>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div class="relative flex-1 sm:flex-initial">
              <input
                v-model="filterQuery"
                type="text"
                placeholder="Filter by organization or email"
                class="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">⌕</span>
            </div>
            <button class="btn btn-secondary" :disabled="isLoading" @click="refreshOrganizations">
              {{ isLoading ? 'Refreshing…' : 'Refresh' }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="text-gray-500 text-sm">Loading organizations…</div>
        <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>
        <div v-else-if="organizations.length === 0" class="text-sm text-gray-500">No organizations found.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('name')">
                    <span>Organization</span>
                    <span v-if="sortKey === 'name'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('code')">
                    <span>Code</span>
                    <span v-if="sortKey === 'code'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('createdAt')">
                    <span>Created</span>
                    <span v-if="sortKey === 'createdAt'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('adminName')">
                    <span>Primary Admin</span>
                    <span v-if="sortKey === 'adminName'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('adminEmail')">
                    <span>Admin Email</span>
                    <span v-if="sortKey === 'adminEmail'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button class="flex items-center gap-1" @click="setSort('adminCreatedAt')">
                    <span>Admin Since</span>
                    <span v-if="sortKey === 'adminCreatedAt'" class="text-gray-400">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                  </button>
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="organization in displayedOrganizations" 
                :key="organization.id"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                @click="openOrganizationDetails(organization)"
              >
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ organization.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  <span class="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                    {{ organization.code }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(organization.createdAt) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">
                  <template v-if="organization.firstAdmin">
                    {{ formatName(organization.firstAdmin.firstName, organization.firstAdmin.lastName) }}
                  </template>
                  <span v-else class="text-gray-400">No admin</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {{ organization.firstAdmin?.email || '—' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {{ organization.firstAdmin?.createdAt ? formatDate(organization.firstAdmin.createdAt) : '—' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500" @click.stop>
                  <div class="flex items-center gap-2">
                    <a
                      v-if="organization.firstAdmin?.email"
                      :href="`mailto:${organization.firstAdmin.email}`"
                      class="text-amber-600 hover:text-amber-800"
                    >
                      Email
                    </a>
                    <button
                      class="btn btn-secondary"
                      :disabled="isSendingEmail(organization.id)"
                      @click="triggerWelcomeEmail(organization)"
                    >
                      <span v-if="isSendingEmail(organization.id)">Sending…</span>
                      <span v-else>Send Welcome Email</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- QR Codes Tab -->
      <div v-show="activeTab === 'qrcodes'" class="rounded-lg border p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Preprinted QR Codes</h2>
            <p class="text-gray-600">Manage unassigned QR codes for future organizations.</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn btn-secondary" :disabled="isLoadingQRCodes" @click="refreshQRCodes">
              {{ isLoadingQRCodes ? 'Refreshing…' : 'Refresh' }}
            </button>
            <button class="btn btn-primary" @click="openCreateQRCodeDrawer">
              <Icon icon="mdi:plus" class="h-5 w-5 mr-1" />
              Create QR Code
            </button>
          </div>
        </div>

        <div v-if="isLoadingQRCodes" class="text-gray-500 text-sm">Loading QR codes…</div>
        <div v-else-if="qrError" class="text-sm text-red-600">{{ qrError }}</div>
        <div v-else-if="qrCodes.length === 0" class="flex flex-col items-center gap-3 py-16">
          <Icon icon="mdi:qrcode-off" class="h-12 w-12 text-gray-300" />
          <p class="text-sm text-gray-500">No preprinted QR codes yet. Create one to get started.</p>
        </div>
        <div v-else>
          <SuperQRCodeTable
            :qr-codes="qrCodes"
            @edit="openEditQRCodeDrawer"
            @delete="openDeleteQRCodeModal"
            @preview="openQRCodePreview"
            @download="downloadQRCode"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <button class="btn btn-secondary" @click="clearUnlock">Lock</button>
      </div>
    </div>

    <!-- QR Code Form Drawer -->
    <Drawer :show="qrDrawerOpen" width="max-w-2xl" @close="closeQRCodeDrawer">
      <template #header>
        <div class="flex items-center gap-3">
          <Icon icon="mdi:qrcode" class="h-6 w-6 text-amber-600" />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ editingQRCode ? 'Edit QR Code' : 'Create QR Code' }}</h3>
            <p class="text-sm text-gray-500">{{ editingQRCode ? 'Update QR code details' : 'Add a new preprinted QR code' }}</p>
          </div>
        </div>
      </template>

      <template #content>
        <SuperQRCodeForm
          :qr="editingQRCode"
          :loading="isSavingQRCode"
          @submit="handleQRCodeSubmit"
          @cancel="closeQRCodeDrawer"
          @value-change="handleQRValueChange"
        />
      </template>
    </Drawer>

    <!-- QR Code Preview Drawer -->
    <SuperQRCodePreview
      :open="previewDrawerOpen"
      :qr="previewingQRCode"
      @close="closeQRCodePreview"
      @download="downloadQRCode"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="deleteModalOpen"
      title="Delete QR Code"
      :message="`Are you sure you want to delete the QR code '${deletingQRCode?.name || deletingQRCode?.code}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="isDeletingQRCode"
      @confirm="handleDeleteQRCode"
      @cancel="closeDeleteQRCodeModal"
    />

    <!-- Organization Details Drawer -->
    <OrganizationDetailsDrawer
      :open="organizationDetailsOpen"
      :organization-id="selectedOrganizationId"
      :passcode="passcode"
      @close="closeOrganizationDetails"
    />
  </div>
</template>


<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import { useToast } from '@/plugins/toast'
import { createSuperQRCode, deleteSuperQRCode, getSuperOrganizations, getSuperQRCodes, sendAdminWelcomeEmailManually, updateSuperQRCode } from '@/api'
import { Icon } from '@iconify/vue'
import Drawer from '@/components/Drawer.vue'
import SuperQRCodeForm from '@/components/admin/SuperQRCodeForm.vue'
import SuperQRCodeTable from '@/components/admin/SuperQRCodeTable.vue'
import SuperQRCodePreview from '@/components/admin/SuperQRCodePreview.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import QRComponent from '@/components/QRComponent.vue'
import OrganizationDetailsDrawer from '@/components/admin/OrganizationDetailsDrawer.vue'

const PASSCODE = 'coolbrew'
const STORAGE_KEY = 'isSuperAdmin'
const STORAGE_PASSCODE_KEY = 'superAdminPasscode'

// Tab state
const activeTab = ref('organizations')

// Organizations state
const passcode = ref('')
const isUnlocked = ref(false)
const hasStoredUnlock = ref(false)
const error = ref('')
const isLoading = ref(false)
const organizations = ref([])
const sendingEmailIds = ref(new Set())
const filterQuery = ref('')
const toast = useToast()
const sortKey = ref('createdAt')
const sortOrder = ref('desc')

// Organization details drawer state
const organizationDetailsOpen = ref(false)
const selectedOrganizationId = ref(null)

// QR Codes state
const isLoadingQRCodes = ref(false)
const qrCodes = ref([])
const qrError = ref('')
const qrDrawerOpen = ref(false)
const editingQRCode = ref(null)
const isSavingQRCode = ref(false)
const previewDrawerOpen = ref(false)
const previewingQRCode = ref(null)
const deleteModalOpen = ref(false)
const deletingQRCode = ref(null)
const isDeletingQRCode = ref(false)
const currentQRValue = ref('')

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
}

const formatName = (first, last) => {
  const fullName = [first, last].filter(Boolean).join(' ').trim()
  return fullName || '—'
}

const fetchOrganizations = async () => {
  if (!passcode.value) {
    error.value = 'Passcode required to load organizations.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await getSuperOrganizations(passcode.value)
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected payload format')
    }
    organizations.value = response.data
  } catch (err) {
    console.error('Failed to load super admin organizations', err)
    organizations.value = []
    const message = err?.response?.data?.message || err.message || 'Failed to load organizations'
    error.value = message
    toast(message, 'error')
  } finally {
    isLoading.value = false
  }
}

const refreshOrganizations = () => {
  fetchOrganizations()
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const setSort = (key) => {
  if (sortKey.value === key) {
    toggleSortOrder()
    return
  }

  sortKey.value = key
  sortOrder.value = key === 'name' || key === 'code' || key === 'adminName' || key === 'adminEmail' ? 'asc' : 'desc'
}

const normalizedQuery = computed(() => filterQuery.value.trim().toLowerCase())

const sortedOrganizations = computed(() => {
  const list = [...organizations.value]
  const key = sortKey.value
  const order = sortOrder.value

  const compare = (a, b) => {
    const valueFor = (item) => {
      switch (key) {
        case 'name':
          return item.name?.toLowerCase() || ''
        case 'code':
          return item.code?.toLowerCase() || ''
        case 'createdAt':
          return item.createdAt ? new Date(item.createdAt).getTime() : 0
        case 'adminName':
          return formatName(item.firstAdmin?.firstName, item.firstAdmin?.lastName).toLowerCase()
        case 'adminEmail':
          return item.firstAdmin?.email?.toLowerCase() || ''
        case 'adminCreatedAt':
          return item.firstAdmin?.createdAt ? new Date(item.firstAdmin.createdAt).getTime() : 0
        default:
          return ''
      }
    }

    const aValue = valueFor(a)
    const bValue = valueFor(b)

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  }

  return list.sort(compare)
})

const displayedOrganizations = computed(() => {
  const query = normalizedQuery.value
  if (!query) return sortedOrganizations.value

  return sortedOrganizations.value.filter((organization) => {
    const nameMatch = organization.name?.toLowerCase().includes(query)
    const emailMatch = organization.firstAdmin?.email?.toLowerCase().includes(query)
    return Boolean(nameMatch || emailMatch)
  })
})

const isSendingEmail = (id) => sendingEmailIds.value.has(id)

const openOrganizationDetails = (organization) => {
  selectedOrganizationId.value = organization.id
  organizationDetailsOpen.value = true
}

const closeOrganizationDetails = () => {
  organizationDetailsOpen.value = false
  selectedOrganizationId.value = null
}

const triggerWelcomeEmail = async (organization) => {
  if (!organization?.id) {
    toast('Organization not found', 'error')
    return
  }

  if (!passcode.value) {
    toast('Passcode required', 'error')
    return
  }
  sendingEmailIds.value.add(organization.id)

  try {
    const payload = {
      adminEmail: organization.firstAdmin?.email,
      adminFirstName: organization.firstAdmin?.firstName,
      adminLastName: organization.firstAdmin?.lastName,
    }

    if (!payload.adminEmail) {
      toast('Admin email missing. Please update organization contact info.', 'error')
      return
    }

    await sendAdminWelcomeEmailManually(passcode.value, organization.id, payload)
    toast(`Welcome email sent to ${payload.adminEmail}`, 'success')
  } catch (err) {
    console.error('Failed to send welcome email manually:', err)
    const message = err?.response?.data?.message || err?.message || 'Failed to send welcome email'
    toast(message, 'error')
  } finally {
    sendingEmailIds.value.delete(organization.id)
    sendingEmailIds.value = new Set(sendingEmailIds.value)
  }
}

const clearUnlock = () => {
  isUnlocked.value = false
  organizations.value = []
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
  try { localStorage.removeItem(STORAGE_PASSCODE_KEY) } catch {}
  toast('Super admin locked', 'success')
}

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
  try { localStorage.setItem(STORAGE_PASSCODE_KEY, passcode.value) } catch {}
  fetchOrganizations()
  fetchQRCodes()
  toast('Super admin unlocked', 'success')
}

// QR Code Functions
const fetchQRCodes = async () => {
  if (!passcode.value) {
    qrError.value = 'Passcode required to load QR codes.'
    return
  }

  isLoadingQRCodes.value = true
  qrError.value = ''

  try {
    const response = await getSuperQRCodes(passcode.value)
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected payload format')
    }
    qrCodes.value = response.data
  } catch (err) {
    console.error('Failed to load super admin QR codes', err)
    qrCodes.value = []
    const message = err?.response?.data?.message || err.message || 'Failed to load QR codes'
    qrError.value = message
    toast(message, 'error')
  } finally {
    isLoadingQRCodes.value = false
  }
}

const refreshQRCodes = () => {
  fetchQRCodes()
}

const openCreateQRCodeDrawer = () => {
  editingQRCode.value = null
  qrDrawerOpen.value = true
}

const openEditQRCodeDrawer = (qr) => {
  editingQRCode.value = qr
  qrDrawerOpen.value = true
}

const closeQRCodeDrawer = () => {
  qrDrawerOpen.value = false
  editingQRCode.value = null
  currentQRValue.value = ''
}

const handleQRValueChange = (value) => {
  currentQRValue.value = value
}

const handleQRCodeSubmit = async (payload) => {
  if (!passcode.value) {
    toast('Passcode required', 'error')
    return
  }

  isSavingQRCode.value = true

  try {
    if (editingQRCode.value) {
      // Update existing QR code
      const response = await updateSuperQRCode(passcode.value, editingQRCode.value._id || editingQRCode.value.id, payload)
      const updatedQR = response.data
      const index = qrCodes.value.findIndex(qr => (qr._id || qr.id) === (updatedQR._id || updatedQR.id))
      if (index !== -1) {
        qrCodes.value[index] = updatedQR
      }
      toast('QR code updated successfully', 'success')
    } else {
      // Create new QR code
      const response = await createSuperQRCode(passcode.value, payload)
      qrCodes.value.unshift(response.data)
      toast('QR code created successfully', 'success')
    }
    closeQRCodeDrawer()
  } catch (err) {
    console.error('Failed to save QR code:', err)
    const message = err?.response?.data?.message || err?.message || 'Failed to save QR code'
    toast(message, 'error')
  } finally {
    isSavingQRCode.value = false
  }
}

const openDeleteQRCodeModal = (qr) => {
  deletingQRCode.value = qr
  deleteModalOpen.value = true
}

const closeDeleteQRCodeModal = () => {
  deleteModalOpen.value = false
  deletingQRCode.value = null
}

const handleDeleteQRCode = async () => {
  if (!deletingQRCode.value || !passcode.value) {
    toast('Invalid request', 'error')
    return
  }

  isDeletingQRCode.value = true

  try {
    await deleteSuperQRCode(passcode.value, deletingQRCode.value._id || deletingQRCode.value.id)
    qrCodes.value = qrCodes.value.filter(qr => (qr._id || qr.id) !== (deletingQRCode.value._id || deletingQRCode.value.id))
    toast('QR code deleted successfully', 'success')
    closeDeleteQRCodeModal()
  } catch (err) {
    console.error('Failed to delete QR code:', err)
    const message = err?.response?.data?.message || err?.message || 'Failed to delete QR code'
    toast(message, 'error')
  } finally {
    isDeletingQRCode.value = false
  }
}

const openQRCodePreview = (qr) => {
  previewingQRCode.value = qr
  previewDrawerOpen.value = true
}

const closeQRCodePreview = () => {
  previewDrawerOpen.value = false
  previewingQRCode.value = null
}

const downloadQRCode = async (qr) => {
  try {
    // Create a temporary container for the QR code
    const container = document.createElement('div')
    container.id = 'qr-download-temp'
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.background = 'white'
    container.style.padding = '40px'
    document.body.appendChild(container)

    const qrValue = `https://brewtokens.com/onboarding?code=${qr.code}`
    
    // Create a wrapper with the QR code and labels
    const wrapper = document.createElement('div')
    wrapper.style.display = 'flex'
    wrapper.style.flexDirection = 'column'
    wrapper.style.alignItems = 'center'
    wrapper.style.gap = '16px'
    wrapper.style.padding = '20px'
    wrapper.style.background = 'white'
    wrapper.style.fontFamily = 'sans-serif'

    // Create canvas for QR code using qrcode library
    const QRCodeLib = await import('qrcode')
    const canvas = document.createElement('canvas')
    await QRCodeLib.toCanvas(canvas, qrValue, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    // Add QR canvas to wrapper
    wrapper.appendChild(canvas)

    // Add name label
    if (qr.name) {
      const nameLabel = document.createElement('div')
      nameLabel.textContent = qr.name
      nameLabel.style.fontWeight = 'bold'
      nameLabel.style.fontSize = '18px'
      nameLabel.style.color = '#111827'
      nameLabel.style.textAlign = 'center'
      wrapper.appendChild(nameLabel)
    }

    // Add code label
    const codeLabel = document.createElement('div')
    codeLabel.textContent = qr.code
    codeLabel.style.fontSize = '14px'
    codeLabel.style.color = '#6B7280'
    codeLabel.style.textAlign = 'center'
    codeLabel.style.fontFamily = 'monospace'
    wrapper.appendChild(codeLabel)

    container.appendChild(wrapper)

    // Wait for next tick to ensure rendering
    await nextTick()

    // Capture the container as an image
    const capturedCanvas = await html2canvas(wrapper, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      logging: false
    })

    // Convert to blob and download
    capturedCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${qr.code}.png`
      link.click()
      URL.revokeObjectURL(url)
      
      // Clean up
      document.body.removeChild(container)
      toast('QR code downloaded', 'success')
    })
  } catch (err) {
    console.error('Failed to download QR code:', err)
    toast('Failed to download QR code', 'error')
  }
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    isUnlocked.value = stored === 'true'
    hasStoredUnlock.value = isUnlocked.value
    if (isUnlocked.value) {
      const storedPasscode = localStorage.getItem(STORAGE_PASSCODE_KEY)
      if (storedPasscode) {
        passcode.value = storedPasscode
        fetchOrganizations()
        fetchQRCodes()
      }
    }
  } catch {}
})

</script>

<style scoped>
</style>


