<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
    <!-- Navigation Bar -->
    <nav class="bg-white/80 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <router-link to="/" class="btn btn-secondary btn-sm hover:bg-blue-50">
              ← Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </nav>


    <!-- Login Form -->
    <div class="flex-grow flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg ring-1 ring-black/5 sm:rounded-xl sm:px-10">
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary w-full"
              >
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </button>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                :disabled="isLoading"
                class="btn btn-secondary w-full"
                @click="handleDemoLogin"
              >
                {{ isLoading ? 'Signing in...' : 'Try Demo Account' }}
              </button>
            </div>

            <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
              {{ error }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

// Demo account credentials from seeder
const DEMO_EMAIL = 'sample@brewtokens.com'
const DEMO_PASSWORD = 'Password123!'

const store = useStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('login', { 
      credentials: form,
      redirect
    })
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}

const handleDemoLogin = async () => {
  // Populate form with demo credentials
  form.email = DEMO_EMAIL
  form.password = DEMO_PASSWORD
  
  // Submit the form
  await handleSubmit()
}
</script>
