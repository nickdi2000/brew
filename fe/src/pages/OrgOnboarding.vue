<template>
  <div class="min-h-screen bg-black text-white overflow-hidden relative">
    <!-- Epic background shine effects -->
    <div class="absolute inset-0">
      <!-- Primary shine beam -->
      <div class="absolute inset-0 bg-gradient-radial from-amber-500/20 via-transparent to-transparent animate-pulse-slow"></div>
      
      <!-- Diagonal shine streaks -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-amber-400/50 to-transparent transform -skew-x-12 animate-shine-1"></div>
        <div class="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent transform skew-x-12 animate-shine-2"></div>
        <div class="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-amber-300/40 to-transparent animate-shine-3"></div>
      </div>
      
      <!-- Radial shine orbs -->
      <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-amber-400/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
      <div class="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-radial from-yellow-400/8 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
    </div>
    
    <!-- Back navigation arrow (show on step 2+) -->
    <button 
      v-if="currentStep > 1" 
      @click="goToPreviousStep"
      class="absolute top-8 left-8 z-30 p-3 rounded-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
    >
      <Icon icon="mdi:arrow-up" class="w-6 h-6" />
    </button>
    
    <!-- Wizard container with animated screens -->
    <div class="relative z-10 min-h-screen overflow-hidden">
      
      <!-- SCREEN 1: Welcome -->
      <div 
        class="screen min-h-screen flex flex-col items-center justify-center px-6 py-8"
        :class="getScreenClass(1)"
      >
        <!-- CoinFlip or SpinningQrPlaque at the top -->
        <div class="mb-6 md:mb-12 transform hover:scale-110 transition-all duration-500 drop-shadow-2xl">
          <div class="scale-75 sm:scale-100 md:scale-125">
            <SpinningQrPlaque v-if="qrType === 'plaque'" />
            <CoinFlip v-else :value="'$'" />
          </div>
        </div>
        
        <!-- Epic welcome content -->
        <div class="text-center max-w-4xl space-y-6 md:space-y-12">
          <!-- Heading with epic gradient -->
          <h1 class="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight tracking-tight">
            <span class="block animate-fade-in-up" style="animation-delay: 0.2s;">BREW</span>
            <span class="block animate-fade-in-up" style="animation-delay: 0.4s;">TOKENS</span>
          </h1>
          
          <!-- Code attempt info (if came from Gold route) -->
          <div v-if="hasAttemptedCode" class="animate-fade-in-up bg-gray-900/60 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 max-w-sm mx-auto" style="animation-delay: 0.6s;">
            <div class="flex items-center justify-center text-amber-400">
              <Icon icon="mdi:qrcode" class="w-8 h-8" />
            </div>
            <p class="text-gray-300 text-lg mt-3 text-center font-medium">
              Let's bring this code to life!
            </p>
          </div>
          
          <!-- Simple description -->
          <p v-if="!hasAttemptedCode" class="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed animate-fade-in-up px-4" style="animation-delay: 0.6s;">
            Transform your venue into a
            <span class="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-semibold">rewards destination</span>
          </p>
          
          <!-- Call to action -->
          <div class="pt-6 md:pt-12 animate-fade-in-up" style="animation-delay: 0.8s;">
            <button 
              class="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-black py-4 px-8 sm:py-5 sm:px-10 md:py-6 md:px-14 rounded-2xl text-lg sm:text-xl md:text-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-2xl"
              @click="goToNextStep"
            >
              <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                <span>GET STARTED</span>
                <Icon icon="mdi:rocket-launch" class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
              </span>
              
              <!-- Epic shine sweep -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
            </button>
          </div>
        </div>
        
        <!-- Tiny code display at bottom -->
        <div v-if="hasAttemptedCode" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs font-mono opacity-60">
          {{ attemptedCode }}
        </div>
      </div>
      
      <!-- SCREEN 2: User Type Selection -->
      <div 
        class="screen min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
        :class="getScreenClass(2)"
      >
        <div class="text-center max-w-2xl space-y-6 md:space-y-8">
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            How can we help you?
          </h2>
          
          <p class="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed px-4">
            Tell us a bit about yourself to get started
          </p>
          
          <div class="space-y-4 md:space-y-6 pt-6 md:pt-8">
            <!-- Primary: Venue Owner/Manager -->
            <button 
              class="group w-full relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-black py-4 sm:py-5 md:py-6 px-6 sm:px-8 rounded-2xl text-base sm:text-lg md:text-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl"
              @click="selectUserType('venue')"
            >
              <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                <Icon icon="mdi:store" class="w-5 h-5 sm:w-6 sm:h-6" />
                <span>I manage a venue</span>
              </span>
              
              <!-- Shine sweep -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
            </button>
            
            <!-- Secondary: Customer -->
            <button 
              class="group w-full relative bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 hover:border-gray-500 py-4 sm:py-5 md:py-6 px-6 sm:px-8 rounded-2xl text-base sm:text-lg md:text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
              @click="selectUserType('customer')"
            >
              <span class="flex items-center justify-center space-x-2 sm:space-x-3">
                <Icon icon="mdi:gift-outline" class="w-5 h-5 sm:w-6 sm:h-6" />
                <span>I just want points</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- SCREEN 3: Account Status Selection (Venue owners only) -->
      <div 
        v-show="currentStep === 3 && userType === 'venue'"
        class="screen min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
        :class="getScreenClass(3, 'venue')"
      >
        <div class="text-center max-w-2xl space-y-6 md:space-y-8">
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            Welcome to BrewTokens!
          </h2>
          
          <p class="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed px-4">
            Are you already registered or is this your first time?
          </p>
          
          <div class="space-y-4 md:space-y-6 pt-6 md:pt-8">
            <!-- Primary: New Account -->
            <button 
              class="group w-full relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-black py-4 sm:py-5 md:py-6 px-6 sm:px-8 rounded-2xl text-base sm:text-lg md:text-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl"
              @click="selectAccountStatus('new')"
            >
              <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                <Icon icon="mdi:account-plus" class="w-5 h-5 sm:w-6 sm:h-6" />
                <span>I need to create an account</span>
              </span>
              
              <!-- Shine sweep -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
            </button>
            
            <!-- Secondary: Existing Account -->
            <button 
              class="group w-full relative bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 hover:border-gray-500 py-4 sm:py-5 md:py-6 px-6 sm:px-8 rounded-2xl text-base sm:text-lg md:text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
              @click="selectAccountStatus('existing')"
            >
              <span class="flex items-center justify-center space-x-2 sm:space-x-3">
                <Icon icon="mdi:account-check" class="w-5 h-5 sm:w-6 sm:h-6" />
                <span>I already have an account</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- SCREEN 4A: Customer End Screen -->
      <div 
        v-show="currentStep === 4 && userType === 'customer'"
        class="screen min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
        :class="getScreenClass(4, 'customer')"
      >
        <div class="text-center max-w-2xl space-y-6 md:space-y-8">
          <div class="text-amber-400 mb-4">
            <Icon icon="mdi:clock-outline" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
          </div>
          
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            QR Code Not Set Up Yet
          </h2>
          
          <p class="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed px-4">
            This QR code hasn't been activated by a venue owner yet.
          </p>
          
          <p class="text-base sm:text-lg text-gray-400 px-4">
            Know a business owner who'd love to reward their customers? Share this QR code with them to get started!
          </p>
          
          <div class="pt-6 md:pt-8">
            <button 
              class="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-black py-3 sm:py-4 px-6 sm:px-8 rounded-2xl text-base sm:text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl"
              @click="goToHome"
            >
              <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                <Icon icon="mdi:home" class="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Go to Homepage</span>
              </span>
              
              <!-- Shine sweep -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- SCREEN 4B: Venue Name Form -->
      <div 
        v-show="currentStep === 4 && userType === 'venue'"
        class="screen min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
        :class="getScreenClass(4, 'venue')"
      >
        <div class="text-center max-w-lg space-y-6 md:space-y-8">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            Tell us about your venue
          </h2>
          
          <p class="text-lg sm:text-xl text-gray-300 font-light leading-relaxed px-4">
            Let's get your rewards program set up
          </p>
          
          <form @submit.prevent="handleVenueNameSubmit" class="space-y-6">
            <div class="text-left">
              <label for="venueName" class="block text-sm font-medium text-gray-300 mb-2">
                Venue Name
              </label>
              <input 
                id="venueName"
                v-model="venueName"
                type="text" 
                required 
                class="w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your venue name"
              />
            </div>
            
            <div class="pt-4">
              <button 
                type="submit"
                :disabled="!venueName.trim()"
                class="group w-full relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-black font-black py-3 sm:py-4 px-6 sm:px-8 rounded-2xl text-base sm:text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                  <Icon icon="mdi:arrow-right" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Continue</span>
                </span>
                
                <!-- Shine sweep -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- SCREEN 5: Email & Google Auth -->
      <div 
        v-show="currentStep === 5 && userType === 'venue'"
        class="screen min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
        :class="getScreenClass(5, 'venue')"
      >
        <div class="text-center max-w-lg space-y-6 md:space-y-8">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
            Create your account
          </h2>
          
          <p class="text-lg sm:text-xl text-gray-300 font-light leading-relaxed px-4">
            How would you like to sign up?
          </p>
          
          <!-- Google Sign-in Button -->
          <div class="flex flex-col items-center space-y-4">
            <button
              type="button"
              class="gsi-material-button w-full max-w-sm"
              :disabled="isSubmitting"
              @click="handleGoogleClick"
            >
              <div class="gsi-material-button-state"></div>
              <div class="gsi-material-button-content-wrapper">
                <div class="gsi-material-button-icon">
                  <Icon icon="logos:google-icon" class="h-5 w-5" />
                </div>
                <span class="gsi-material-button-contents">
                  {{ isSubmitting ? 'Connecting...' : 'Continue with Google' }}
                </span>
              </div>
            </button>
            
            <!-- Divider -->
            <div class="relative w-full max-w-sm">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-black text-gray-400">or continue with email</span>
              </div>
            </div>
            
            <!-- Email Form -->
            <form @submit.prevent="handleEmailSubmit" class="w-full max-w-sm space-y-6">
              <div class="text-left">
                <label for="userEmail" class="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input 
                  id="userEmail"
                  v-model="userEmail"
                  type="email" 
                  required 
                  class="w-full px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
              
              <button 
                type="submit"
                :disabled="isSubmitting || !userEmail.trim()"
                class="group w-full relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-black font-black py-3 sm:py-4 px-6 sm:px-8 rounded-2xl text-base sm:text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <span class="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                  <Icon v-if="!isSubmitting" icon="mdi:rocket-launch" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <Icon v-else icon="mdi:loading" class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>{{ isSubmitting ? 'Creating account...' : 'Create Account' }}</span>
                </span>
                
                <!-- Shine sweep -->
                <div v-if="!isSubmitting" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Enhanced floating particles -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="epic-particle epic-particle-1"></div>
      <div class="epic-particle epic-particle-2"></div>
      <div class="epic-particle epic-particle-3"></div>
      <div class="epic-particle epic-particle-4"></div>
      <div class="epic-particle epic-particle-5"></div>
      <div class="epic-particle epic-particle-6"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import CoinFlip from '@/components/CoinFlip.vue';
import SpinningQrPlaque from '@/components/SpinningQrPlaque.vue';
import { register } from '@/api';
import { useToast } from '@/plugins/toast';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();
const toast = useToast();
const attemptedCode = ref('');
const qrType = ref(''); // 'plaque' or default (coin)

// Wizard state
const currentStep = ref(1);
const previousStep = ref(0);
const isTransitioning = ref(false);
const transitionDirection = ref('forward'); // 'forward' or 'backward'
const accountStatus = ref(''); // 'new' or 'existing'
const userType = ref(''); // 'venue' or 'customer'
const venueName = ref('');
const userEmail = ref('');
const isSubmitting = ref(false);

// Check if we have a code parameter from the Gold route
const hasAttemptedCode = computed(() => !!attemptedCode.value);

// Screen class management for smooth transitions
const getScreenClass = (stepNumber, requiredUserType = null) => {
  // Check if this screen should be shown based on user type
  if (requiredUserType && userType.value !== requiredUserType) {
    return 'screen-hidden';
  }
  
  if (currentStep.value === stepNumber) {
    if (isTransitioning.value) {
      return transitionDirection.value === 'forward' ? 'screen-entering-from-bottom' : 'screen-entering-from-top';
    } else {
      return 'screen-active';
    }
  } else if (previousStep.value === stepNumber && isTransitioning.value) {
    return transitionDirection.value === 'forward' ? 'screen-exiting-up' : 'screen-exiting-down';
  } else if (stepNumber < currentStep.value) {
    return 'screen-above';
  } else {
    return 'screen-below';
  }
};

// Navigation functions with smooth transitions
const goToNextStep = async () => {
  const maxStep = userType.value === 'venue' ? 5 : 4;
  if (currentStep.value < maxStep && !isTransitioning.value) {
    isTransitioning.value = true;
    transitionDirection.value = 'forward';
    previousStep.value = currentStep.value;
    
    // Small delay to ensure CSS classes are applied
    await new Promise(resolve => setTimeout(resolve, 50));
    
    currentStep.value += 1;
    console.log('📍 Moving forward to step:', currentStep.value);
    
    // Wait for transition to complete
    setTimeout(() => {
      isTransitioning.value = false;
      previousStep.value = 0;
    }, 600); // Match CSS transition duration
  }
};

const goToPreviousStep = async () => {
  if (currentStep.value > 1 && !isTransitioning.value) {
    isTransitioning.value = true;
    transitionDirection.value = 'backward';
    previousStep.value = currentStep.value;
    
    // Small delay to ensure CSS classes are applied
    await new Promise(resolve => setTimeout(resolve, 50));
    
    currentStep.value -= 1;
    console.log('📍 Moving backward to step:', currentStep.value);
    
    // Wait for transition to complete
    setTimeout(() => {
      isTransitioning.value = false;
      previousStep.value = 0;
    }, 600); // Match CSS transition duration
  }
};

const selectAccountStatus = (status) => {
  accountStatus.value = status;
  console.log('📝 Account status selected:', status);
  
  if (status === 'existing') {
    // TODO: Redirect to login flow for existing users
    console.log('🔄 Redirecting to login for existing users...');
    // For now, show an alert - this should be replaced with actual login flow
    alert('Login flow for existing users will be implemented here.');
    return;
  }
  
  // If new account, continue to venue name form
  goToNextStep();
};

const selectUserType = (type) => {
  userType.value = type;
  console.log('👤 User type selected:', type);
  
  if (type === 'customer') {
    // Customers skip account status and go directly to the end screen (step 4)
    currentStep.value = 4;
  } else {
    // Venue owners go to account status selection (step 3)
    goToNextStep();
  }
};

const goToHome = () => {
  console.log('🏠 Redirecting to homepage');
  router.push('/');
};

const handleVenueNameSubmit = () => {
  if (!venueName.value.trim()) {
    return;
  }
  console.log('✅ Venue name collected:', venueName.value);
  goToNextStep();
};

const handleGoogleClick = async () => {
  if (isSubmitting.value) {
    return;
  }

  try {
    isSubmitting.value = true;

    const auth = window.google?.accounts?.oauth2;
    if (!auth) {
      throw new Error('Google accounts SDK not loaded');
    }

    const codeClient = auth.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      ux_mode: 'popup',
      callback: async (response) => {
        if (response.error) {
          toast('Google authentication failed', 'error');
          isSubmitting.value = false;
          return;
        }

        try {
          // Exchange the authorization code for ID token
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: response.code,
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: window.location.origin,
              grant_type: 'authorization_code'
            })
          });

          const tokenData = await tokenResponse.json();

          if (!tokenData.id_token) {
            throw new Error('Failed to get ID token from Google');
          }

          // Call our backend with the ID token, venue name, and QR code
          const apiResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3391/api'}/auth/google/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: tokenData.id_token,
              breweryName: venueName.value,
              qrCode: attemptedCode.value || null
            })
          });

          const apiData = await apiResponse.json();

          if (!apiData.success) {
            throw new Error(apiData.message || 'Registration failed');
          }

          const { token, user, organization, refreshToken, refreshTokenExpiresAt } = apiData.data;

          // Store auth data
          store.commit('SET_TOKEN', token);
          store.commit('SET_USER', user);

          if (refreshToken) {
            store.commit('SET_REFRESH_TOKEN', refreshToken);
          }
          if (refreshTokenExpiresAt) {
            store.commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
          }

          // Store organization data
          if (organization) {
            store.commit('organization/SET_ORGANIZATION', organization);
          }

          toast('Account created successfully!', 'success');

          // Redirect to admin dashboard
          setTimeout(() => {
            router.push('/admin');
          }, 1000);

        } catch (error) {
          console.error('Google login API error:', error);
          toast(error.message || 'Failed to sign in with Google', 'error');
        } finally {
          isSubmitting.value = false;
        }
      }
    });

    codeClient.requestCode();
  } catch (error) {
    console.error('Google auth error:', error);
    toast(error.message || 'Failed to initialize Google Sign In', 'error');
    isSubmitting.value = false;
  }
};

const handleEmailSubmit = async () => {
  if (!userEmail.value.trim() || !venueName.value.trim()) {
    toast('Please provide all required information', 'error');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    console.log('📝 Submitting registration:', {
      breweryName: venueName.value,
      email: userEmail.value,
      qrCode: attemptedCode.value
    });
    
    // Call the register API with email-based registration
    const response = await register({
      breweryName: venueName.value,
      email: userEmail.value,
      password: 'changeMe', // Default password that users can change later
      qrCode: attemptedCode.value || null
    });
    
    console.log('✅ Registration successful:', response.data);
    
    if (response.data.success) {
      const { token, user, organization, refreshToken, refreshTokenExpiresAt } = response.data.data;
      
      // Store auth data in Vuex
      store.commit('SET_TOKEN', token);
      store.commit('SET_USER', user);
      
      if (refreshToken) {
        store.commit('SET_REFRESH_TOKEN', refreshToken);
      }
      if (refreshTokenExpiresAt) {
        store.commit('SET_REFRESH_TOKEN_EXPIRES_AT', refreshTokenExpiresAt);
      }
      
      // Store organization data
      if (organization) {
        store.commit('organization/SET_ORGANIZATION', organization);
        console.log('🏢 Organization created:', organization.name, 'with code:', organization.code);
      }
      
      toast('Account created successfully! Check your email for login instructions.', 'success');
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    }
  } catch (error) {
    console.error('❌ Registration failed:', error);
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    toast(errorMessage, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  // Get the code from query parameters if it exists
  if (route.query.code) {
    attemptedCode.value = String(route.query.code);
    console.log('📝 Organization onboarding initiated with attempted code:', attemptedCode.value);
  }
  
  // Get the qrType parameter if it exists (e.g., ?qrType=plaque)
  if (route.query.qrType) {
    qrType.value = String(route.query.qrType);
    console.log('🎨 QR display type:', qrType.value);
  }
  
  // Load Google Sign-In SDK
  if (!window.google?.accounts?.oauth2) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google authentication SDK');
    };
    document.head.appendChild(script);
  }
});
</script>

<style scoped>
/* Epic fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

/* Smooth slide transition animations */
.screen {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

/* Active screen - fully visible and interactive */
.screen-active {
  transform: translateY(0);
  opacity: 1;
  z-index: 20;
  pointer-events: auto;
}

/* Forward transitions - screen sliding in from bottom */
.screen-entering-from-bottom {
  transform: translateY(100vh);
  opacity: 0;
  z-index: 25;
  pointer-events: none;
  animation: slideInFromBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Forward transitions - screen sliding up and out */
.screen-exiting-up {
  transform: translateY(0);
  opacity: 1;
  z-index: 15;
  pointer-events: none;
  animation: slideUpAndOut 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Backward transitions - screen sliding in from top */
.screen-entering-from-top {
  transform: translateY(-100vh);
  opacity: 0;
  z-index: 25;
  pointer-events: none;
  animation: slideInFromTop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Backward transitions - screen sliding down and out */
.screen-exiting-down {
  transform: translateY(0);
  opacity: 1;
  z-index: 15;
  pointer-events: none;
  animation: slideDownAndOut 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Screens that are above current (already passed) */
.screen-above {
  transform: translateY(-100vh);
  opacity: 0;
  z-index: 10;
  pointer-events: none;
}

/* Screens that are below current (not reached yet) */
.screen-below {
  transform: translateY(100vh);
  opacity: 0;
  z-index: 10;
  pointer-events: none;
}

/* Hidden screens (wrong user type, etc) */
.screen-hidden {
  transform: translateY(100vh);
  opacity: 0;
  z-index: 5;
  pointer-events: none;
}

/* Forward transition keyframe animations */
@keyframes slideInFromBottom {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUpAndOut {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
}

/* Backward transition keyframe animations */
@keyframes slideInFromTop {
  0% {
    transform: translateY(-100vh);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDownAndOut {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

/* Radial gradient utility */
.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

/* Epic background shine animations */
@keyframes shine-1 {
  0%, 100% {
    opacity: 0;
    transform: translateY(-100%) skewX(-12deg);
  }
  50% {
    opacity: 1;
    transform: translateY(200%) skewX(-12deg);
  }
}

@keyframes shine-2 {
  0%, 100% {
    opacity: 0;
    transform: translateY(200%) skewX(12deg);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-100%) skewX(12deg);
  }
}

@keyframes shine-3 {
  0%, 100% {
    opacity: 0.2;
    transform: scaleY(0.5);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
}

.animate-shine-1 {
  animation: shine-1 6s infinite ease-in-out;
}

.animate-shine-2 {
  animation: shine-2 8s infinite ease-in-out;
  animation-delay: 2s;
}

.animate-shine-3 {
  animation: shine-3 4s infinite ease-in-out;
  animation-delay: 1s;
}

/* Slow pulse animation */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s infinite ease-in-out;
}

/* Floating orb animations */
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }
  33% {
    transform: translateY(-30px) translateX(20px) scale(1.1);
  }
  66% {
    transform: translateY(20px) translateX(-15px) scale(0.9);
  }
}

@keyframes float-reverse {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }
  33% {
    transform: translateY(25px) translateX(-25px) scale(0.8);
  }
  66% {
    transform: translateY(-20px) translateX(30px) scale(1.2);
  }
}

.animate-float-slow {
  animation: float-slow 12s infinite ease-in-out;
}

.animate-float-reverse {
  animation: float-reverse 15s infinite ease-in-out;
  animation-delay: 3s;
}

/* Epic floating particles */
.epic-particle {
  position: absolute;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(245, 158, 11, 0.3) 40%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: epic-float 12s infinite ease-in-out;
  filter: blur(0.5px);
}

.epic-particle-1 {
  width: 8px;
  height: 8px;
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.epic-particle-2 {
  width: 12px;
  height: 12px;
  top: 30%;
  right: 15%;
  animation-delay: 4s;
}

.epic-particle-3 {
  width: 6px;
  height: 6px;
  bottom: 25%;
  left: 15%;
  animation-delay: 8s;
}

.epic-particle-4 {
  width: 10px;
  height: 10px;
  top: 70%;
  right: 20%;
  animation-delay: 2s;
}

.epic-particle-5 {
  width: 7px;
  height: 7px;
  bottom: 40%;
  right: 8%;
  animation-delay: 6s;
}

.epic-particle-6 {
  width: 9px;
  height: 9px;
  top: 50%;
  left: 5%;
  animation-delay: 10s;
}

@keyframes epic-float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0;
  }
  10%, 90% {
    opacity: 0.6;
  }
  25% {
    transform: translateY(-40px) translateX(30px) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-60px) translateX(-20px) scale(0.8);
    opacity: 1;
  }
  75% {
    transform: translateY(-30px) translateX(40px) scale(1.1);
    opacity: 0.7;
  }
}

/* Enhanced text effects */
.text-shadow-glow {
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.4), 0 0 80px rgba(245, 158, 11, 0.2);
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.4);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.6);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .epic-particle {
    display: none; /* Hide particles on mobile for performance */
  }
  
  /* Reduce animation intensity on mobile */
  .animate-shine-1,
  .animate-shine-2,
  .animate-shine-3 {
    animation-duration: 8s;
  }
}

/* Ultra responsive text sizing */
@media (max-width: 480px) {
  .text-5xl {
    font-size: 2.5rem;
  }
  
  /* Ensure proper spacing on very small screens */
  .space-y-8 > * + * {
    margin-top: 1.5rem;
  }
}

/* Ensure proper focus states */
button:focus {
  outline: none;
}

/* Backdrop blur support fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(17, 24, 39, 0.8);
  }
}

/* Google Sign-in Button Styles */
.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border: 1px solid #747775;
  border-radius: 4px;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', Arial, sans-serif;
  font-size: 14px;
  height: 44px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  transition: background-color 0.218s, border-color 0.218s, box-shadow 0.218s, transform 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  flex-grow: 1;
  font-family: 'Roboto', Arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gsi-material-button .gsi-material-button-state {
  transition: opacity 0.218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: not-allowed;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents,
.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 0.38;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state,
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 0.12;
}

.gsi-material-button:not(:disabled):hover {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
  transform: translateY(-1px);
}

.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
  background-color: #303030;
  opacity: 0.08;
}
</style>
