<template>
  <div class="min-h-screen bg-white flex flex-col relative overflow-hidden">
    <!-- Geometric Shapes -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <!-- Top right circle -->
      <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-50/40"></div>
      <!-- Bottom left triangle -->
      <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-50/30" style="clip-path: polygon(0 100%, 100% 100%, 0 0);"></div>
      <!-- Middle right shape -->
      <div class="absolute top-1/3 -right-8 w-32 h-32 bg-amber-50/20" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div>
      <!-- Small dots pattern -->
      <div class="absolute top-1/4 left-8 w-24 h-24 opacity-20" 
           style="background-image: radial-gradient(circle, #f59e0b 1px, transparent 1px); background-size: 12px 12px;"></div>
    </div>
    
    <!-- Navigation Bar -->
    <nav class="bg-white/80 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <router-link to="/" class="btn btn-secondary btn-sm hover:bg-amber-50 transition-colors">
              ← Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Login Form -->
    <div class="flex-grow flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src="/images/brewtokens-logo-trans.png" alt="BrewTokens" class="mx-auto h-20 w-auto mb-6 animate-fade-in" />
        <h2 class="text-center text-3xl font-extrabold text-gray-900 mb-2">
          {{ activeTab === 'login' ? 'Welcome Back!' : 'Join BrewTokens' }}
        </h2>
        <p class="text-gray-600">
          {{ activeTab === 'login' ? 'Sign in to manage your rewards' : 'Create your brewery account today' }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-lg ring-1 ring-black/5 sm:rounded-xl sm:px-10 transform transition-all duration-300 hover:shadow-xl">
          <!-- Tab Navigation -->
          <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              :class="[
                'flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-300',
                activeTab === 'login' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              @click="setActiveTab('login')"
            >
              <Icon icon="mdi:login" class="inline-block w-4 h-4 mr-2" />
              Login
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all duration-300',
                !ENABLE_SIGNUP ? 'opacity-50 cursor-not-allowed' : '',
                activeTab === 'register' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              @click="ENABLE_SIGNUP ? setActiveTab('register') : router.push('/coming-soon')"
              :disabled="!ENABLE_SIGNUP"
            >
              <Icon icon="mdi:account-plus" class="inline-block w-4 h-4 mr-2" />
              Register
            </button>
          </div>

          <!-- Login Form -->
          <form 
            v-show="activeTab === 'login'" 
            class="space-y-6 transition-all duration-300" 
            :class="{ 'opacity-100': activeTab === 'login', 'opacity-0': activeTab !== 'login' }"
            data-cy="login-form" 
            @submit.prevent="handleLoginSubmit"
          >
            <div class="group">
              <label for="login-email" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:email" class="inline-block w-4 h-4 mr-1" />
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="login-email"
                  v-model="loginForm.email"
                  type="email"
                  required
                  data-cy="email-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div class="group">
              <label for="login-password" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:lock" class="inline-block w-4 h-4 mr-1" />
                Password
              </label>
              <div class="mt-1">
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  type="password"
                  required
                  data-cy="password-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                :disabled="isLoading"
                data-cy="login-button"
                class="btn btn-primary w-full group relative overflow-hidden transition-all duration-300"
              >
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon="mdi:login" class="w-5 h-5" />
                  {{ isLoading ? 'Signing in...' : 'Sign in' }}
                </span>
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
                class="btn btn-secondary w-full group relative overflow-hidden transition-all duration-300"
                @click="handleDemoLogin"
              >
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon="mdi:beer" class="w-5 h-5" />
                  {{ isLoading ? 'Signing in...' : 'Try Demo Account' }}
                </span>
              </button>
            </div>

            <div v-if="error && activeTab === 'login'" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                <Icon icon="mdi:alert-circle" class="w-5 h-5" />
                {{ error }}
              </p>
            </div>
          </form>

          <!-- Onboarding Form -->
          <form 
            v-show="activeTab === 'onboarding'" 
            class="space-y-6 transition-all duration-300" 
            :class="{ 'opacity-100': activeTab === 'onboarding', 'opacity-0': activeTab !== 'onboarding' }"
            data-cy="onboarding-form" 
            @submit.prevent="handleOnboardingSubmit"
          >
            <div class="group">
              <label for="brewery-name" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:store" class="inline-block w-4 h-4 mr-1" />
                Brewery Name
              </label>
              <div class="mt-1">
                <input
                  id="brewery-name"
                  v-model="onboardingForm.breweryName"
                  type="text"
                  required
                  data-cy="brewery-name-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your brewery name"
                />
              </div>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                :disabled="isLoading"
                data-cy="onboarding-button"
                class="btn btn-primary w-full group relative overflow-hidden transition-all duration-300"
              >
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon="mdi:check-circle" class="w-5 h-5" />
                  {{ isLoading ? 'Creating Account...' : 'Continue' }}
                </span>
              </button>
            </div>

            <div v-if="error && activeTab === 'onboarding'" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                <Icon icon="mdi:alert-circle" class="w-5 h-5" />
                {{ error }}
              </p>
            </div>
          </form>

          <!-- Registration Form -->
          <form 
            v-show="activeTab === 'register'" 
            class="space-y-6 transition-all duration-300" 
            :class="{ 'opacity-100': activeTab === 'register', 'opacity-0': activeTab !== 'register' }"
            data-cy="register-form" 
            @submit.prevent="handleRegisterSubmit"
          >
            <div class="group">
              <label for="brewery-name" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:store" class="inline-block w-4 h-4 mr-1" />
                Brewery Name
              </label>
              <div class="mt-1">
                <input
                  id="brewery-name"
                  v-model="registerForm.breweryName"
                  type="text"
                  required
                  data-cy="brewery-name-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your brewery name"
                />
              </div>
            </div>

            <div class="group">
              <label for="register-email" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:email" class="inline-block w-4 h-4 mr-1" />
                Email address
              </label>
              <div class="mt-1">
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  type="email"
                  required
                  data-cy="register-email-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div class="group">
              <label for="register-password" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                <Icon icon="mdi:lock" class="inline-block w-4 h-4 mr-1" />
                Password
              </label>
              <div class="mt-1">
                <input
                  id="register-password"
                  v-model="registerForm.password"
                  type="password"
                  required
                  minlength="6"
                  data-cy="register-password-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your password (min. 6 characters)"
                />
              </div>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                :disabled="isLoading"
                data-cy="register-button"
                class="btn btn-primary w-full group relative overflow-hidden transition-all duration-300"
              >
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon="mdi:account-plus" class="w-5 h-5" />
                  {{ isLoading ? 'Creating Account...' : 'Create Brewery Account' }}
                </span>
              </button>
            </div>

            <div v-if="error && activeTab === 'register'" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                <Icon icon="mdi:alert-circle" class="w-5 h-5" />
                {{ error }}
              </p>
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
import { Icon } from '@iconify/vue'

// Get signup status from environment variable
const ENABLE_SIGNUP = import.meta.env.VITE_ENABLE_SIGNUP === 'true'

// Add fade-in animation to Tailwind
const style = document.createElement('style')
style.textContent = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}`
document.head.appendChild(style)

// Demo account credentials from seeder
const DEMO_EMAIL = 'sample@brewtokens.com'
const DEMO_PASSWORD = 'Password123!'

const store = useStore()
const router = useRouter()

// Tab state
const activeTab = ref('login')

// Login form
const loginForm = reactive({
  email: '',
  password: ''
})

// Registration form
const registerForm = reactive({
  breweryName: '',
  email: '',
  password: ''
})

// Onboarding form
const onboardingForm = reactive({
  breweryName: '',
  qrCode: '' // This will be passed from the URL
})

// Get QR code from URL if present
const qrCode = router.currentRoute.value.query.qrCode
if (qrCode) {
  onboardingForm.qrCode = qrCode
  activeTab.value = 'onboarding'
}

const isLoading = ref(false)
const error = ref('')

// Tab switching
const setActiveTab = (tab) => {
  activeTab.value = tab
  error.value = '' // Clear errors when switching tabs
}

const handleLoginSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('login', { 
      credentials: loginForm,
      redirect
    })
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}

const handleRegisterSubmit = async () => {
  // If registration is disabled, redirect to coming soon
  if (!ENABLE_SIGNUP) {
    router.push('/coming-soon')
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('register', { 
      userData: registerForm,
      redirect
    })
  } catch (err) {
    console.error('Registration error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}

const handleDemoLogin = async () => {
  // Populate form with demo credentials
  loginForm.email = DEMO_EMAIL
  loginForm.password = DEMO_PASSWORD
  
  // Submit the login form
  await handleLoginSubmit()
}

const validateOnboardingForm = () => {
  if (!onboardingForm.breweryName.trim()) {
    error.value = 'Please enter your brewery name'
    return false
  }
  if (!onboardingForm.qrCode) {
    error.value = 'Missing QR code parameter'
    return false
  }
  return true
}

const handleOnboardingSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // Validate form
    if (!validateOnboardingForm()) {
      isLoading.value = false
      return
    }
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('register', { 
      userData: {
        breweryName: onboardingForm.breweryName.trim(),
        email: '', // Empty email as requested
        password: Math.random().toString(36).slice(-12), // Random password since we won't be using it
        qrCode: onboardingForm.qrCode // Pass the QR code to use
      },
      redirect
    })
  } catch (err) {
    console.error('Onboarding error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during onboarding'
  } finally {
    isLoading.value = false
  }
}
</script>
