<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <!-- Glowing orbs -->
      <div class="absolute top-20 right-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-amber-400/5 blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col justify-center items-center py-4 sm:py-6 md:py-12 px-4 sm:px-6 relative z-10 max-h-screen overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center flex flex-col items-center">
        <div class="flex justify-center mb-8 sm:mb-12 md:mb-16">
          <CoinFlip :value="'...'" class="scale-75 sm:scale-100 md:scale-125" />
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
          {{ loadingMessage }}
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-400">{{ loadingSubtext }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="text-center max-w-3xl">
        <div class="mb-4 sm:mb-6 md:mb-8">
          <Icon icon="mdi:check-circle" class="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-green-400 mx-auto animate-bounce-once" />
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6">Welcome!</h1>
        <p class="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6 sm:mb-8 md:mb-12">Your journey begins now</p>
        <button
          class="btn btn-primary px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-lg sm:text-xl md:text-2xl font-bold"
          @click="goToDashboard"
        >
          Enter Dashboard
        </button>
      </div>

      <!-- Registration View -->
      <div v-else class="text-center max-w-4xl w-full">
        <!-- Coin Animation -->
        <div class="mb-4 sm:mb-6 md:mb-10 lg:mb-12 flex justify-center">
          <CoinFlip :value="100" class="scale-75 sm:scale-90 md:scale-110 lg:scale-125" />
        </div>

        <!-- Welcome Message -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-5 md:mb-6 tracking-tight px-2">
          Welcome to <span class="text-amber-400">BrewTokens</span>
        </h1>

        <!-- Info Display (editable on hover) -->
        <div class="space-y-3 sm:space-y-4 md:space-y-6 mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto">
          <!-- Venue Name Card -->
          <div 
            v-if="form.venueName && !editingVenue"
            class="info-card bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/20 cursor-pointer group relative overflow-hidden"
            @click="editingVenue = true"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p class="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2 relative z-10">Venue</p>
            <p class="text-white text-2xl sm:text-3xl md:text-4xl font-bold relative z-10 group-hover:text-amber-400 transition-colors duration-300">
              {{ form.venueName }}
            </p>
            <div class="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Icon icon="mdi:pencil" class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
          </div>

          <!-- Venue Name Edit Mode -->
          <div 
            v-if="editingVenue"
            class="bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/50 animate-slide-in"
          >
            <p class="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Venue</p>
            <input
              v-model="form.venueName"
              ref="venueInput"
              type="text"
              placeholder="Venue Name"
              class="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white text-lg sm:text-xl md:text-2xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 mb-3"
            />
            <div class="flex gap-2 sm:gap-3">
              <button
                type="button"
                class="btn btn-primary flex-1 py-2 sm:py-2.5 text-sm sm:text-base"
                @click="editingVenue = false"
              >
                <Icon icon="mdi:check" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />
                Done
              </button>
              <button
                type="button"
                class="btn btn-secondary flex-1 py-2 sm:py-2.5 text-sm sm:text-base"
                @click="form.venueName = tempVenue; editingVenue = false"
              >
                <Icon icon="mdi:close" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />
                Cancel
              </button>
            </div>
          </div>

          <!-- Email Card -->
          <div 
            v-if="form.email && !editingEmail"
            class="info-card bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/20 cursor-pointer group relative overflow-hidden"
            @click="editingEmail = true"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p class="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2 relative z-10">Email</p>
            <p class="text-white text-xl sm:text-2xl md:text-3xl font-semibold relative z-10 group-hover:text-amber-400 transition-colors duration-300 break-all">
              {{ form.email }}
            </p>
            <div class="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Icon icon="mdi:pencil" class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
          </div>

          <!-- Email Edit Mode -->
          <div 
            v-if="editingEmail"
            class="bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/50 animate-slide-in"
          >
            <p class="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Email</p>
            <input
              v-model="form.email"
              ref="emailInput"
              type="email"
              placeholder="Email Address"
              class="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white text-lg sm:text-xl md:text-2xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 mb-3"
            />
            <div class="flex gap-2 sm:gap-3">
              <button
                type="button"
                class="btn btn-primary flex-1 py-2 sm:py-2.5 text-sm sm:text-base"
                @click="editingEmail = false"
              >
                <Icon icon="mdi:check" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />
                Done
              </button>
              <button
                type="button"
                class="btn btn-secondary flex-1 py-2 sm:py-2.5 text-sm sm:text-base"
                @click="form.email = tempEmail; editingEmail = false"
              >
                <Icon icon="mdi:close" class="w-4 h-4 sm:w-5 sm:h-5 inline mr-1" />
                Cancel
              </button>
            </div>
          </div>

          <!-- Initial Input Card (when fields are empty) -->
          <div v-if="!form.venueName || !form.email" class="bg-gray-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-amber-500/20 animate-slide-in">
            <p class="text-gray-400 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Please provide your details to continue</p>
            <div class="space-y-3 sm:space-y-4">
              <input
                v-if="!form.venueName"
                v-model="form.venueName"
                type="text"
                placeholder="Venue Name"
                class="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white text-base sm:text-lg md:text-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              />
              <input
                v-if="!form.email"
                v-model="form.email"
                type="email"
                placeholder="Email Address"
                class="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gray-900/50 border border-gray-600 rounded-lg sm:rounded-xl text-white text-base sm:text-lg md:text-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <!-- Hidden form inputs -->
        <form @submit.prevent="handleRegister" class="hidden">
          <input v-model="form.venueName" type="text" required />
          <input v-model="form.email" type="email" required />
          <input v-model="form.password" type="password" required minlength="8" />
        </form>

        <!-- CTA Button -->
        <button
          type="button"
          :disabled="isLoading || !form.venueName || !form.email"
          class="btn btn-primary px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 lg:py-6 text-xl sm:text-2xl md:text-3xl font-bold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          @click="handleRegister"
        >
          Start My Journey
        </button>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 bg-red-500/10 border border-red-500/50 rounded-xl max-w-2xl mx-auto animate-shake">
          <div class="text-red-400 text-sm sm:text-base md:text-lg lg:text-xl flex items-start justify-center gap-2 sm:gap-3">
            <Icon icon="mdi:alert-circle" class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0 mt-0.5" />
            <span class="flex-1 text-left">
              {{ error }}
              <span v-if="showLoginLink">
                <br class="my-2" />
                <router-link to="/login" class="text-amber-400 hover:text-amber-300 underline font-semibold inline-flex items-center gap-1">
                  Go to login page
                  <Icon icon="mdi:arrow-right" class="w-4 h-4" />
                </router-link>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import CoinFlip from '@/components/CoinFlip.vue'
import { checkUserCredentials } from '@/api'

const store = useStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Form state
const form = ref({
  venueName: '',
  email: '',
  password: ''
})

const isLoading = ref(false)
const isSuccess = ref(false)
const error = ref('')
const showLoginLink = ref(false)
const loadingMessage = ref('Creating Magic')
const loadingSubtext = ref('Setting up your account...')

// Edit state
const editingVenue = ref(false)
const editingEmail = ref(false)
const tempVenue = ref('')
const tempEmail = ref('')

// Refs for inputs
const venueInput = ref(null)
const emailInput = ref(null)

// Watch for edit mode changes to focus inputs and store temp values

watch(editingVenue, async (newVal) => {
  if (newVal) {
    tempVenue.value = form.value.venueName
    await nextTick()
    venueInput.value?.focus()
  }
})

watch(editingEmail, async (newVal) => {
  if (newVal) {
    tempEmail.value = form.value.email
    await nextTick()
    emailInput.value?.focus()
  }
})

// Initialize form from URL parameters and auto-check credentials
onMounted(async () => {
  const { email, password, venueName } = route.query
  
  if (email) {
    form.value.email = email
  }
  if (password) {
    form.value.password = password
  }
  if (venueName) {
    form.value.venueName = venueName
  }

  // If we have both email and password in URL, automatically check credentials
  if (email && password) {
    await checkAndAutoLogin()
  }
})

// Auto-check and login if credentials are in URL
const checkAndAutoLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''
    showLoginLink.value = false
    loadingMessage.value = 'Checking Account'
    loadingSubtext.value = 'Please wait...'

    // Validate we have the required data
    if (!form.value.email.trim() || !form.value.password) {
      isLoading.value = false
      return
    }

    // Check if the user exists and if the password is correct
    const checkResponse = await checkUserCredentials(form.value.email.trim(), form.value.password)
    const { exists, passwordCorrect } = checkResponse.data.data

    if (exists && passwordCorrect) {
      // User exists and password is correct - log them in
      loadingMessage.value = 'Welcome Back!'
      loadingSubtext.value = 'Logging in to your existing account...'
      
      // Add a delay to show the welcome back message
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Proceed with login
      await store.dispatch('login', {
        credentials: {
          email: form.value.email.trim(),
          password: form.value.password
        },
        redirect: '/admin'
      })

      // Show success state
      isSuccess.value = true
      toast('Successfully logged in!', 'success')
      return
    }

    if (exists && !passwordCorrect) {
      // User exists but password is incorrect
      isLoading.value = false
      error.value = 'An account with this email already exists, but the password is incorrect.'
      showLoginLink.value = true
      return
    }

    // User doesn't exist - stop loading and let them register manually
    isLoading.value = false
  } catch (err) {
    console.error('Auto-login check error:', err)
    // On error, just stop loading and let user proceed manually
    isLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    error.value = ''
    showLoginLink.value = false
    loadingMessage.value = 'Creating Magic'
    loadingSubtext.value = 'Setting up your account...'

    // Validate form
    if (!form.value.venueName.trim()) {
      error.value = 'Please enter a venue name'
      isLoading.value = false
      return
    }
    if (!form.value.email.trim()) {
      error.value = 'Please enter an email address'
      isLoading.value = false
      return
    }
    if (form.value.password.length < 8) {
      error.value = 'Password must be at least 8 characters'
      isLoading.value = false
      return
    }

    // Register user (the auto-check on mount already handled existing users)
    await store.dispatch('register', {
      userData: {
        breweryName: form.value.venueName.trim(),
        email: form.value.email.trim(),
        password: form.value.password
      },
      redirect: '/admin'
    })

    // Show success state briefly before redirect
    isSuccess.value = true
    toast('Account created successfully! Redirecting...', 'success')
    
    // The store action will handle the redirect
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err.response?.data?.message || err.message || 'An error occurred during registration'
    
    // Check if error is because user already exists
    if (err.response?.data?.message?.includes('already exists')) {
      showLoginLink.value = true
    }
    
    toast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

const goToDashboard = () => {
  router.push('/admin')
}
</script>

<style scoped>
/* Bounce animation for success state */
@keyframes bounce-once {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce-once {
  animation: bounce-once 0.6s ease-out;
}

/* Slide in animation for edit mode */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Shake animation for errors */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-out;
}

/* Info card hover effect - smooth transitions */
.info-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-2px);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.3);
}

/* Smooth scrollbar for mobile */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.5);
}
</style>

