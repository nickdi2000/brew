<template>
  <div class="max-w-6xl w-full mx-auto px-4">
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
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Super Admin Portal</h2>
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
            <button class="btn btn-secondary" @click="clearUnlock">Lock</button>
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
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="organization in displayedOrganizations" :key="organization.id">
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="btn btn-secondary" @click="clearUnlock">Lock</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/plugins/toast'
import { getSuperOrganizations } from '@/api'

const PASSCODE = 'coolbrew'
const STORAGE_KEY = 'isSuperAdmin'
const STORAGE_PASSCODE_KEY = 'superAdminPasscode'

const passcode = ref('')
const isUnlocked = ref(false)
const hasStoredUnlock = ref(false)
const error = ref('')
const isLoading = ref(false)
const organizations = ref([])
const filterQuery = ref('')
const toast = useToast()
const sortKey = ref('createdAt')
const sortOrder = ref('desc')

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
  toast('Super admin unlocked', 'success')
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
      }
    }
  } catch {}
})

</script>

<style scoped>
</style>


