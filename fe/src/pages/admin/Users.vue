<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Users Management</h1>
      <p class="mt-2 text-sm text-gray-600">
        Manage administrative users for your organization. All users have full admin access.
      </p>
    </div>

    <!-- Add User Button -->
    <div class="mb-6 flex justify-end">
      <button
        class="btn btn-primary"
        @click="openAddUserDrawer"
      >
        <Icon icon="mdi:plus" class="h-5 w-5 mr-2" />
        Add User
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-600 mr-2" />
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Added
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="user in users" 
            :key="user._id || user.id"
            :class="[
              isCurrentUser(user) 
                ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                : 'hover:bg-gray-50 cursor-pointer'
            ]"
            @click="!isCurrentUser(user) && openEditUserDrawer(user)"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div v-if="user.picture" class="flex-shrink-0 h-10 w-10">
                  <img class="h-10 w-10 rounded-full" :src="user.picture" :alt="getUserName(user)" />
                </div>
                <div v-else class="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account" class="h-6 w-6 text-amber-600" />
                </div>
                <div class="ml-4">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900">
                      {{ getUserName(user) }}
                    </span>
                    <span 
                      v-if="isCurrentUser(user)"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800"
                    >
                      You
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
              <div v-if="user.googleId" class="text-xs text-gray-500 flex items-center mt-1">
                <Icon icon="mdi:google" class="h-3 w-3 mr-1" />
                Google SSO
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ user.status || 'active' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
              <button
                v-if="!isCurrentUser(user)"
                class="text-red-600 hover:text-red-900"
                @click="openDeleteConfirmation(user)"
                title="Remove user"
              >
                <Icon icon="mdi:delete" class="h-5 w-5" />
              </button>
              <span v-else class="text-gray-400 text-xs italic">Cannot edit yourself</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0" class="text-center py-12">
        <Icon icon="mdi:account-group" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-sm font-medium text-gray-900">No users</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding a new user.</p>
      </div>
    </div>

    <!-- Add/Edit User Drawer -->
    <Drawer :show="showUserDrawer" @close="closeUserDrawer" width="max-w-md">
      <template #header>
        <div class="flex items-center gap-3">
          <Icon :icon="editingUser ? 'mdi:account-edit' : 'mdi:account-plus'" class="h-6 w-6 text-amber-600" />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ editingUser ? 'Edit User' : 'Add User' }}</h3>
            <p class="text-sm text-gray-500">
              {{ editingUser ? 'Update user information' : 'Invite a new user to your organization' }}
            </p>
          </div>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleSaveUser" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="userForm.email"
              type="email"
              required
              :disabled="!!editingUser"
              :class="[
                'w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300',
                editingUser ? 'bg-gray-100 cursor-not-allowed' : ''
              ]"
              placeholder="user@example.com"
            />
            <p v-if="editingUser" class="mt-1 text-xs text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              v-model="userForm.firstName"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
              placeholder="John"
            />
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              v-model="userForm.lastName"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
              placeholder="Doe"
            />
          </div>

          <!-- Authentication Method (only for new users) -->
          <div v-if="!editingUser" class="border-t border-gray-200 pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Authentication Method <span class="text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <label class="flex items-start cursor-pointer">
                <input
                  type="radio"
                  v-model="authMethod"
                  value="magic-link"
                  class="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Send Magic Login Link</span>
                  <p class="text-xs text-gray-500 mt-0.5">
                    User receives an email with a secure login link to access their account
                  </p>
                </div>
              </label>

              <label class="flex items-start cursor-pointer">
                <input
                  type="radio"
                  v-model="authMethod"
                  value="set-password"
                  class="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Set Password</span>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Create a password for this user (they can change it later)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <!-- Password Input (shown only when set-password is selected for new users) -->
          <div v-if="!editingUser && authMethod === 'set-password'" class="space-y-3">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                v-model="userForm.password"
                type="password"
                :required="!editingUser && authMethod === 'set-password'"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="Enter password"
                minlength="8"
              />
              <p class="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                :required="!editingUser && authMethod === 'set-password'"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="Confirm password"
                minlength="8"
              />
              <p v-if="confirmPassword && userForm.password !== confirmPassword" class="mt-1 text-xs text-red-600">
                Passwords do not match
              </p>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex">
              <Icon icon="mdi:information" class="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
              <div class="text-sm text-amber-800">
                <p class="font-medium mb-1">Admin Privileges</p>
                <p>This user will have full administrative access to your organization, including the ability to manage members, rewards, and settings.</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeUserDrawer"
              :disabled="isSaving"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSaving || !userForm.email || !isFormValid"
            >
              <span v-if="isSaving">{{ editingUser ? 'Saving...' : 'Adding...' }}</span>
              <span v-else>{{ editingUser ? 'Save Changes' : 'Add User' }}</span>
            </button>
          </div>
        </form>
      </template>
    </Drawer>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Remove User"
      :message="`Are you sure you want to remove ${getUserName(userToDelete)} from your organization? This action cannot be undone.`"
      confirm-text="Remove User"
      cancel-text="Cancel"
      :loading="isDeleting"
      @confirm="handleDeleteUser"
      @cancel="closeDeleteConfirmation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import { useStore } from 'vuex'
import api from '@/api'
import Drawer from '@/components/Drawer.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const toast = useToast()
const store = useStore()

const users = ref([])
const isLoading = ref(false)
const error = ref('')
const showUserDrawer = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const editingUser = ref(null)
const isSaving = ref(false)
const isDeleting = ref(false)

const userForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  password: ''
})

const authMethod = ref('magic-link')
const confirmPassword = ref('')

const currentUser = computed(() => store.getters.currentUser)

const isFormValid = computed(() => {
  if (!userForm.value.email) return false
  
  // For new users, validate auth method requirements
  if (!editingUser.value && authMethod.value === 'set-password') {
    if (!userForm.value.password || userForm.value.password.length < 8) return false
    if (userForm.value.password !== confirmPassword.value) return false
  }
  
  return true
})

const isCurrentUser = (user) => {
  return currentUser.value && (user._id === currentUser.value._id || user.id === currentUser.value.id)
}

const getUserName = (user) => {
  if (!user) return ''
  const parts = []
  if (user.firstName) parts.push(user.firstName)
  if (user.lastName) parts.push(user.lastName)
  if (parts.length > 0) return parts.join(' ')
  return user.email?.split('@')[0] || 'Unknown'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const fetchUsers = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/users/admin')
    console.log('Fetched users:', JSON.stringify(response.data.data, null, 2))
    users.value = response.data.data || []
  } catch (err) {
    console.error('Failed to fetch users:', err)
    error.value = err.response?.data?.message || 'Failed to load users'
    toast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

const openAddUserDrawer = () => {
  editingUser.value = null
  userForm.value = {
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  }
  authMethod.value = 'magic-link'
  confirmPassword.value = ''
  showUserDrawer.value = true
}

const openEditUserDrawer = (user) => {
  editingUser.value = user
  userForm.value = {
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: ''
  }
  authMethod.value = 'magic-link'
  confirmPassword.value = ''
  showUserDrawer.value = true
}

const closeUserDrawer = () => {
  showUserDrawer.value = false
  editingUser.value = null
  userForm.value = {
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  }
  authMethod.value = 'magic-link'
  confirmPassword.value = ''
}

const handleSaveUser = async () => {
  if (!userForm.value.email) {
    toast('Email is required', 'error')
    return
  }

  // Validate password for new users using set-password method
  if (!editingUser.value && authMethod.value === 'set-password') {
    if (!userForm.value.password || userForm.value.password.length < 8) {
      toast('Password must be at least 8 characters', 'error')
      return
    }
    if (userForm.value.password !== confirmPassword.value) {
      toast('Passwords do not match', 'error')
      return
    }
  }

  isSaving.value = true
  
  try {
    if (editingUser.value) {
      // Update existing user
      const userId = editingUser.value._id || editingUser.value.id
      const payload = {
        firstName: userForm.value.firstName.trim(),
        lastName: userForm.value.lastName.trim()
      }

      const response = await api.put(`/users/admin/${userId}`, payload)
      console.log('User updated:', JSON.stringify(response.data.data, null, 2))
      
      toast('User updated successfully', 'success')
    } else {
      // Create new user
      const payload = {
        email: userForm.value.email.trim(),
        firstName: userForm.value.firstName.trim(),
        lastName: userForm.value.lastName.trim(),
        isAdmin: true,
        authMethod: authMethod.value
      }

      // Only include password if set-password method is selected
      if (authMethod.value === 'set-password') {
        payload.password = userForm.value.password
      }

      const response = await api.post('/users/admin', payload)
      console.log('User created:', JSON.stringify(response.data.data, null, 2))
      
      const successMessage = authMethod.value === 'magic-link'
        ? 'User added successfully. They will receive a login link via email.'
        : 'User added successfully with password.'
      
      toast(successMessage, 'success')
    }
    
    // Refresh the users list
    await fetchUsers()
    closeUserDrawer()
  } catch (err) {
    console.error('Failed to save user:', err)
    const errorMessage = err.response?.data?.message || 'Failed to save user'
    toast(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

const openDeleteConfirmation = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeDeleteConfirmation = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const handleDeleteUser = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true
  
  try {
    const userId = userToDelete.value._id || userToDelete.value.id
    await api.delete(`/users/admin/${userId}`)
    
    toast('User removed successfully', 'success')
    
    // Refresh the users list
    await fetchUsers()
    closeDeleteConfirmation()
  } catch (err) {
    console.error('Failed to delete user:', err)
    const errorMessage = err.response?.data?.message || 'Failed to remove user'
    toast(errorMessage, 'error')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>


