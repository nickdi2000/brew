<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white shadow rounded-lg">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">My Profile</h2>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="space-y-8">
          <!-- User Information Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">User Information</h3>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Name Fields -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="form.firstName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    :disabled="!isEditing"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="form.lastName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    :disabled="!isEditing"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  disabled
                />
                <p class="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3">
                <button
                  v-if="!isEditing"
                  type="button"
                  @click="startEditing"
                  class="btn btn-secondary"
                >
                  Edit Profile
                </button>
                <template v-else>
                  <button
                    type="button"
                    @click="cancelEditing"
                    class="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isSaving"
                  >
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                  </button>
                </template>
              </div>
            </form>
          </div>

          <!-- Organization Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
            <div v-else-if="isLoading" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            </div>
            <div v-else class="bg-gray-50 rounded-lg p-4">
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Organization Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ organization?.name || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Role</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ user?.role || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Member Count</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ organization?.memberCount || 0 }} members</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created On</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(organization?.createdAt) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from '@/plugins/toast'

const store = useStore()
const toast = useToast()

// State
const isEditing = ref(false)
const isSaving = ref(false)
const form = ref({
  firstName: '',
  lastName: '',
  email: ''
})

// Computed
const user = computed(() => store.getters.currentUser)
const organization = computed(() => store.getters['organization/config'])

// Methods
const startEditing = () => {
  form.value = {
    firstName: user.value?.firstName || '',
    lastName: user.value?.lastName || '',
    email: user.value?.email || ''
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  form.value = {
    firstName: user.value?.firstName || '',
    lastName: user.value?.lastName || '',
    email: user.value?.email || ''
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    await store.dispatch('updateProfile', {
      firstName: form.value.firstName,
      lastName: form.value.lastName
    })
    isEditing.value = false
    toast('Profile updated successfully', 'success')
  } catch (error) {
    toast(error.message || 'Failed to update profile', 'error')
  } finally {
    isSaving.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// State
const isLoading = ref(false)
const error = ref(null)

// Initialization
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    await store.dispatch('organization/initializeStore')
  } catch (err) {
    error.value = err.message || 'Failed to load organization data'
    console.error('Error loading organization data:', err)
  } finally {
    isLoading.value = false
  }
})
</script>