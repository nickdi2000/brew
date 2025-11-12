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
        <img
        v-on:dblclick.stop="dev = !dev"
          src="/images/brewtokens-logo-beer.webp"
          alt="BrewTokens"
          class="mx-auto h-12 w-auto mb-0 animate-fade-in cursor-pointer select-none"
        />
   
      </div>

      <div class="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
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
                activeTab === 'register' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              @click="setActiveTab('register')"
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
                  :class="[
                    'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200',
                    loginForm.highlightEmailError
                      ? 'border-red-500 ring-4 ring-red-200 animate-pulse'
                      : 'border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300'
                  ]"
                  placeholder="Enter your email"
                  @input="loginForm.highlightEmailError = false"
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
                class="w-full bg-black text-white rounded-lg py-3 px-4 font-medium text-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon="mdi:login" class="w-5 h-5" />
                  {{ isLoading ? 'Signing in...' : 'Sign in' }}
                </span>
              </button>

              <button
                type="button"
                :disabled="isLoading || loginForm.isMagicSubmitting || loginForm.magicLinkSent"
                class="flex items-center justify-center gap-2 text-sm transition-all duration-200 text-center w-full"
                :class="[
                  loginForm.magicLinkSent
                    ? 'text-gray-400 cursor-default'
                    : 'text-amber-600 hover:text-amber-700 underline',
                ]"
                @click="handleMagicLinkLogin"
              >
                <Icon
                  :icon="loginForm.magicLinkSent ? 'mdi:check-circle' : 'mdi:link'"
                  class="w-4 h-4 transition-transform duration-300"
                  :class="{ 'scale-110 text-green-500': loginForm.magicLinkSent }"
                />
                <span class="relative overflow-hidden">
                  <span
                    class="block transition-all duration-300 text-center"
                    :class="{
                      'translate-y-full opacity-0 absolute inset-0': loginForm.magicLinkSent,
                    }"
                  >
                    {{ loginForm.isMagicSubmitting ? 'Sending magic link…' : 'Email me a magic login link' }}
                  </span>
                  <span
                    class="block absolute inset-0 transition-all duration-300"
                    :class="{
                      '-translate-y-full opacity-0': !loginForm.magicLinkSent,
                      'translate-y-0 opacity-100 text-green-600': loginForm.magicLinkSent,
                    }"
                  >
                    Magic link sent
                  </span>
                </span>
              </button>

              <div class="relative" v-if="dev">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                v-if="dev"
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
                Venue Name
              </label>
              <div class="mt-1">
                <input
                  id="brewery-name"
                  v-model="onboardingForm.breweryName"
                  type="text"
                  required
                  data-cy="brewery-name-input"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                  placeholder="Enter your venue name"
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
            <div class="space-y-6">
              <div class="group">
                <label for="register-email" class="block text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">
                  <Icon icon="mdi:email" class="inline-block w-4 h-4 mr-1" />
                  Email
                </label>
                <div class="mt-1">
                  <input
                    id="register-email"
                    v-model="registerForm.email"
                    type="email"
                    required
                    data-cy="register-email-input"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 hover:border-amber-300"
                    placeholder="you@brewandcoffee.com"
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
                    placeholder="Create a secure password"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <button
                  type="submit"
                  :disabled="isLoading"
                  data-cy="register-button"
                  class="btn btn-outline w-full group relative overflow-hidden transition-all duration-300"
                >
                  <span class="relative z-10 flex items-center justify-center gap-2">
                    <Icon icon="mdi:account-plus" class="w-5 h-5" />
                    {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  </span>
                </button>
              </div>
            </div>

            <div v-if="error && activeTab === 'register'" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                <Icon icon="mdi:alert-circle" class="w-5 h-5" />
                {{ error }}
              </p>
            </div>
          </form>
        </div>

        <!-- Google Sign In - Available for both Login and Register -->
        <div v-if="activeTab === 'login' || activeTab === 'register'" class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          <div class="mt-6 flex justify-center">
            <ContinueWithGoogleButton
              :disabled="isLoading"
              @success="handleGoogleAdminSuccess"
            />
          </div>
        </div>

        <p class="mt-4 text-center text-xs text-gray-400">
          Version: {{ appVersion }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import packageJson from '../../package.json' with { type: 'json' }
import ContinueWithGoogleButton from '@/components/auth/ContinueWithGoogleButton.vue'
import { generateMagicLoginLink } from '@/api'
import { sanitizeAdminGooglePayload } from '@/utils/authSanitizers'
import locationMixin from '@/mixins/locationMixin'

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

const route = useRoute()

const dev = ref(false)
const toast = useToast()

const appVersion = computed(() => packageJson.version ?? '0.0.0')

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
  password: '',
  isMagicSubmitting: false,
  magicLinkSent: false,
  highlightEmailError: false
})

// Registration form
const registerForm = reactive({
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

// Check for login credentials in URL parameters
const urlEmail = router.currentRoute.value.query.email
const urlPassword = router.currentRoute.value.query.password

// Populate login form if credentials exist in URL
if (urlEmail) {
  loginForm.email = urlEmail
}
if (urlPassword) {
  loginForm.password = urlPassword
}

const isLoading = ref(false)
const error = ref('')

// Tab switching
const setActiveTab = (tab) => {
  activeTab.value = tab
  error.value = '' // Clear errors when switching tabs
}

const syncTabFromRoute = () => {
  const desiredTab = route.query.tab
  if (desiredTab === 'register') {
    setActiveTab('register')
  }
}

syncTabFromRoute()


const handleLoginSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('login', { 
      credentials: {
        email: loginForm.email,
        password: loginForm.password
      },
      redirect
    })
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
}

const handleMagicLinkLogin = async () => {
  if (!loginForm.email) {
    toast('Enter your account email before requesting a magic link.', 'error')
    loginForm.highlightEmailError = true
    
    // Focus the email input
    setTimeout(() => {
      document.getElementById('login-email')?.focus()
    }, 100)
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      loginForm.highlightEmailError = false
    }, 3000)
    
    return
  }

  loginForm.isMagicSubmitting = true

  try {
    const response = await generateMagicLoginLink(loginForm.email)

    if (!response?.success) {
      throw new Error(response?.message || 'Unable to send magic link. Please try again later.')
    }

    toast('Check your inbox! Your magic login link is on the way.', 'success')
    loginForm.magicLinkSent = true
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Unable to send magic link. Please try again later.'
    console.error('Magic login link request failed:', message)
    toast(message, 'error')
  } finally {
    loginForm.isMagicSubmitting = false
  }
}

const handleRegisterSubmit = async () => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag_report_conversion === 'function') {
      window.gtag_report_conversion()
    }
  } catch (err) {
    console.error('Google tag conversion error:', err)
  }

  let location = null
  try { 
    await locationMixin._getGeo()
    location = locationMixin._location
  } catch (err) {
    console.error('Location error:', err)
  }

 

  try {
    isLoading.value = true
    error.value = ''
    
    // Get redirect from query params or default to /admin
    const redirect = router.currentRoute.value.query.redirect || '/admin'
    
    await store.dispatch('register', { 
      userData: {
        breweryName: '', // Optional, can be set later
        email: registerForm.email,
        password: registerForm.password,
        location: location,
      },
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

const handleGoogleAdminSuccess = async (authPayload) => {
  try {
    const { token, refreshToken, refreshTokenExpiresAt, user } = sanitizeAdminGooglePayload(authPayload)
    if (!token || !user) {
      throw new Error('Invalid authentication payload')
    }

    store.commit('SET_TOKEN', token)
    store.commit('SET_USER', user)

    if (refreshToken) {
      store.commit('SET_REFRESH_TOKEN', refreshToken)
    }
    if (refreshTokenExpiresAt) {
      store.commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt)
    }

    store.commit('SET_LAST_ACTIVITY')

    const redirect = router.currentRoute.value.query.redirect || '/admin'
    await router.push(redirect)
    store.dispatch('startSessionMonitor')
  } catch (error) {
    console.error('Admin Google login handling failed:', error)
    toast(error.response?.data?.message || error.message || 'Failed to sign in with Google', 'error')
  }
}

const validateOnboardingForm = () => {
  if (!onboardingForm.breweryName.trim()) {
    error.value = 'Please enter your venue name'
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
