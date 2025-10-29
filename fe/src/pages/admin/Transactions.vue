<template>
  <div class="p-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
        <p class="mt-1 text-sm text-gray-500">View all transactions across your organization</p>
      </div>
      
      <!-- Filter by type - Horizontal Button Group -->
      <div class="inline-flex rounded-lg bg-gray-100 p-1 gap-1 self-start">
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            filters.type === '' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="setFilter('')"
        >
          <Icon icon="mdi:view-list" class="w-4 h-4 inline-block mr-1.5" />
          All Types
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            filters.type === 'earn' 
              ? 'bg-white text-green-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="setFilter('earn')"
        >
          <Icon icon="mdi:plus-circle" class="w-4 h-4 inline-block mr-1.5" />
          Earned
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            filters.type === 'redeem' 
              ? 'bg-white text-purple-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="setFilter('redeem')"
        >
          <Icon icon="mdi:gift" class="w-4 h-4 inline-block mr-1.5" />
          Redeemed
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            filters.type === 'adjust' 
              ? 'bg-white text-blue-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
          @click="setFilter('adjust')"
        >
          <Icon icon="mdi:pencil" class="w-4 h-4 inline-block mr-1.5" />
          Adjusted
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div class="flex flex-col items-center justify-center space-y-4">
        <Icon icon="mdi:loading" class="w-12 h-12 text-amber-500 animate-spin" />
        <p class="text-gray-500">Loading transactions...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center gap-3">
        <Icon icon="mdi:alert-circle" class="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <h3 class="text-sm font-medium text-red-800">Error loading transactions</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
      <button
        class="mt-4 btn btn-secondary text-sm"
        @click="fetchTransactions"
      >
        <Icon icon="mdi:refresh" class="w-4 h-4 mr-2" />
        Try Again
      </button>
    </div>

    <!-- Transactions Table -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('createdAt')"
              >
                <div class="flex items-center gap-2">
                  Date
                  <Icon 
                    v-if="sort.field === 'createdAt'" 
                    :icon="sort.order === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" 
                    class="w-4 h-4"
                  />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="sortBy('amount')"
              >
                <div class="flex items-center gap-2">
                  Amount
                  <Icon 
                    v-if="sort.field === 'amount'" 
                    :icon="sort.order === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" 
                    class="w-4 h-4"
                  />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!transactions.length">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <Icon icon="mdi:receipt-text-outline" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p class="text-sm">No transactions found</p>
              </td>
            </tr>
            <tr 
              v-for="transaction in transactions" 
              :key="transaction._id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                      {{ getMemberInitials(transaction.member) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ getMemberName(transaction.member) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ transaction.member?.user?.email || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getTypeClass(transaction.type)"
                >
                  <Icon :icon="getTypeIcon(transaction.type)" class="w-3 h-3 mr-1" />
                  {{ transaction.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="text-sm font-semibold"
                  :class="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div v-if="transaction.reward" class="flex items-center gap-1">
                  <Icon icon="mdi:gift" class="w-4 h-4 text-purple-500" />
                  <span>{{ transaction.reward.name }}</span>
                </div>
                <div v-else-if="transaction.metadata?.description" class="max-w-xs truncate">
                  {{ transaction.metadata.description }}
                </div>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.method || 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
          to <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
          of <span class="font-medium">{{ pagination.total }}</span> transactions
        </div>
        <div class="flex gap-2">
          <button
            :disabled="pagination.page === 1"
            class="btn btn-secondary text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 1 }"
            @click="goToPage(pagination.page - 1)"
          >
            <Icon icon="mdi:chevron-left" class="w-5 h-5" />
          </button>
          
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="page === pagination.page 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="pagination.page === pagination.totalPages"
            class="btn btn-secondary text-sm"
            :class="{ 'opacity-50 cursor-not-allowed': pagination.page === pagination.totalPages }"
            @click="goToPage(pagination.page + 1)"
          >
            <Icon icon="mdi:chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { getTransactions } from '@/api'
import { useToast } from '@/plugins/toast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const transactions = ref([])
const loading = ref(false)
const error = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const filters = ref({
  type: ''
})

const sort = ref({
  field: 'createdAt',
  order: 'desc'
})

// Initialize filter from query params
onMounted(() => {
  if (route.query.type) {
    filters.value.type = route.query.type
  }
  if (route.query.page) {
    pagination.value.page = parseInt(route.query.page) || 1
  }
  fetchTransactions()
})

// Watch for route changes (e.g., when navigating from dashboard)
watch(() => route.query, (newQuery) => {
  if (newQuery.type !== undefined && newQuery.type !== filters.value.type) {
    filters.value.type = newQuery.type || ''
    pagination.value.page = 1
    fetchTransactions()
  }
}, { deep: true })

const fetchTransactions = async () => {
  try {
    loading.value = true
    error.value = ''

    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      sortBy: sort.value.field,
      sortOrder: sort.value.order
    }

    if (filters.value.type) {
      params.type = filters.value.type
    }

    const response = await getTransactions(params)
    transactions.value = response.data.data.transactions
    pagination.value = response.data.data.pagination
  } catch (err) {
    console.error('Error fetching transactions:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load transactions'
    toast(error.value, 'error')
  } finally {
    loading.value = false
  }
}

const sortBy = (field) => {
  if (sort.value.field === field) {
    sort.value.order = sort.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sort.value.field = field
    sort.value.order = 'desc'
  }
  pagination.value.page = 1
  updateQueryParams()
  fetchTransactions()
}

const setFilter = (type) => {
  filters.value.type = type
  pagination.value.page = 1
  updateQueryParams()
  fetchTransactions()
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    updateQueryParams()
    fetchTransactions()
  }
}

const updateQueryParams = () => {
  const query = {}
  if (filters.value.type) {
    query.type = filters.value.type
  }
  if (pagination.value.page > 1) {
    query.page = pagination.value.page
  }
  router.push({ query })
}

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p))
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const getMemberName = (member) => {
  if (!member?.user) return 'Unknown Member'
  const { firstName, lastName } = member.user
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  if (lastName) return lastName
  return member.user.email || 'Unknown Member'
}

const getMemberInitials = (member) => {
  if (!member?.user) return '?'
  const { firstName, lastName, email } = member.user
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  if (lastName) return lastName[0].toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

const getTypeClass = (type) => {
  const classes = {
    earn: 'bg-green-100 text-green-800',
    redeem: 'bg-purple-100 text-purple-800',
    adjust: 'bg-blue-100 text-blue-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getTypeIcon = (type) => {
  const icons = {
    earn: 'mdi:plus-circle',
    redeem: 'mdi:gift',
    adjust: 'mdi:pencil'
  }
  return icons[type] || 'mdi:circle'
}
</script>

