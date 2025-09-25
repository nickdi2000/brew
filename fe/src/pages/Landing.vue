<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { signupForBeta } from '@/api';

// Import local images
import brewery1 from '@/assets/images/brewery1.png';
import brewery2 from '@/assets/images/brewery2.png';
import brewery3 from '@/assets/images/brewery3.png';
import triviaratLogo from '@/assets/images/triviarat-logo.png';

// Import public images
const qrCodeImage = '/images/qr-code.png';
const earnedImage = '/images/earned.png';

const currentYear = new Date().getFullYear();
const isMenuOpen = ref(false);
const parallaxContainer = ref(null);

// Beta signup form state
const email = ref('');
const isSubmitting = ref(false);
const submitMessage = ref('');
const submitSuccess = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleScroll = () => {
  if (!parallaxContainer.value) return;
  const scrolled = window.pageYOffset;
  const rate = scrolled * 0.5;
  parallaxContainer.value.style.transform = `translate3d(0, ${rate}px, 0)`;
};

const submitBetaSignup = async (event) => {
  event.preventDefault();
  
  if (!email.value.trim()) {
    submitMessage.value = 'Please enter your email address';
    submitSuccess.value = false;
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    submitMessage.value = 'Please enter a valid email address';
    submitSuccess.value = false;
    return;
  }

  isSubmitting.value = true;
  submitMessage.value = '';

  try {
    const response = await signupForBeta(email.value.trim());

    if (response.data.success) {
      submitSuccess.value = true;
      submitMessage.value = response.data.message;
      email.value = ''; // Clear the form
    } else {
      submitSuccess.value = false;
      submitMessage.value = response.data.message || 'Something went wrong. Please try again.';
    }
  } catch (error) {
    submitSuccess.value = false;
    if (error.response && error.response.data && error.response.data.message) {
      submitMessage.value = error.response.data.message;
    } else {
      submitMessage.value = 'Something went wrong. Please try again.';
    }
    console.error('Beta signup error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  console.log('Landing page mounted');
  AOS.init({
    duration: 1000,
    easing: 'ease-out',
    once: true
  });
  
  window.addEventListener('scroll', handleScroll);
  
  // Animate hero text on load
  gsap.from('.hero-text', {
    duration: 1.5,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
    <!-- Subtle Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Minimal floating elements -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-500/3 rounded-full blur-3xl"></div>
    </div>

    <main>
      <!-- Navigation -->
      <nav class="backdrop-blur-md bg-slate-900/90 sticky top-0 z-50 border-b border-slate-700/50 shadow-xl">
        <div class="container mx-auto px-6">
          <div class="flex justify-between items-center h-20">
            <a href="/" class="text-3xl font-display font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent transition-all duration-300">BrewTokens</a>
          
          <!-- Mobile menu button -->
          <button 
            class="md:hidden p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 focus:outline-none transition-all duration-300" 
            @click="toggleMenu"
            aria-label="Toggle menu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <!-- Navigation links -->
          <div class="hidden md:flex md:items-center md:space-x-8">
            <a href="#about" class="text-slate-300 hover:text-white font-medium transition-all duration-300 relative group">
              <span>About</span>
              <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="#features" class="text-slate-300 hover:text-white font-medium transition-all duration-300 relative group">
              <span>Features</span>
              <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="#brewery-benefits" class="text-slate-300 hover:text-white font-medium transition-all duration-300 relative group">
              <span>For Breweries</span>
              <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a href="#partnership" class="text-slate-300 hover:text-white font-medium transition-all duration-300 relative group">
              <span>Partnership</span>
              <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <router-link to="/login" class="text-slate-300 hover:text-white font-medium transition-all duration-300 relative group">
              <span>Login</span>
              <div class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </router-link>
            <a href="#join-beta" class="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-2xl hover:shadow-2xl transition-all duration-300 font-medium overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span class="relative">Join Beta</span>
            </a>
          </div>
          </div>
        </div>
        
        <!-- Mobile menu -->
        <div 
          v-show="isMenuOpen" 
          class="md:hidden backdrop-blur-md bg-slate-800/90 border-t border-slate-700/50"
        >
          <div class="px-6 pt-4 pb-6 space-y-2">
            <a href="#about" class="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300">About</a>
            <a href="#features" class="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300">Features</a>
            <a href="#brewery-benefits" class="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300">For Breweries</a>
            <a href="#partnership" class="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300">Partnership</a>
            <router-link to="/login" class="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300">Login</router-link>
            <a href="#join-beta" class="block px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300">Join Beta</a>
          </div>
        </div>
      </nav>

    <!-- Hero Section -->
    <div class="relative min-h-screen flex items-center py-20">
      <!-- Background with subtle elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div 
          ref="parallaxContainer"
          class="absolute inset-0 will-change-transform opacity-30"
          style="transform: translate3d(0, 0, 0)"
        >
          <img 
            :src="brewery1" 
            alt="Brewery Interior" 
            class="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <!-- Subtle overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80"></div>
      </div>
      
      <div class="relative container mx-auto px-6 z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Left side - Text content -->
          <div class="space-y-8">
            <div class="space-y-6">
              <h1 class="hero-text font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <span class="bg-gradient-to-r from-white via-blue-400 to-blue-500 bg-clip-text text-transparent">Brew</span>
                <span class="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Tokens</span>
              </h1>
              <p class="hero-text text-2xl md:text-3xl font-semibold text-slate-200 leading-relaxed">
                The Future of Brewery Rewards
              </p>
              <p class="hero-text text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                Transform your brewery with our innovative rewards program. Award points, create lasting loyalty, and watch your business thrive with engaged customers.
              </p>
            </div>
            
            <div class="hero-text flex flex-col sm:flex-row gap-6">
              <a 
                href="#features" 
                class="group inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <span>Explore Features</span>
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
              <a 
                href="#join-beta" 
                class="inline-flex items-center justify-center space-x-3 bg-slate-800/80 hover:bg-slate-700/80 text-white border-2 border-slate-600 hover:border-blue-400 px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <span>Join Beta</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <!-- Right side - Waitlist form -->
          <div class="hero-text">
            <div class="relative group">
              <!-- Modern glass morphism card -->
              <div class="backdrop-blur-xl bg-slate-800/80 border border-slate-600/10 p-10 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl">
                <!-- Content -->
                <div class="space-y-8">
                  <div class="text-center space-y-4">
                    <h3 class="font-display text-4xl font-bold text-white">Join the Beta</h3>
                    <p class="text-slate-300 text-lg">Be among the first to experience the future of brewery rewards</p>
                  </div>
                  
                  <!-- Success/Error Message with enhanced animations -->
                  <transition 
                    enter-active-class="transition-all duration-500 ease-out"
                    enter-from-class="opacity-0 transform scale-95 translate-y-2"
                    enter-to-class="opacity-100 transform scale-100 translate-y-0"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 transform scale-100 translate-y-0"
                    leave-to-class="opacity-0 transform scale-95 translate-y-2"
                  >
                    <div v-if="submitMessage" class="p-6 rounded-2xl border-2" :class="{
                      'bg-green-50/80 text-green-800 border-green-200': submitSuccess,
                      'bg-red-50/80 text-red-800 border-red-200': !submitSuccess
                    }">
                      <div class="flex items-center space-x-4">
                        <div v-if="submitSuccess" class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <div v-else class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </div>
                        <span class="font-semibold text-lg">{{ submitMessage }}</span>
                      </div>
                    </div>
                  </transition>

                  <!-- Form with enhanced styling -->
                  <transition 
                    enter-active-class="transition-all duration-700 ease-out"
                    enter-from-class="opacity-0 transform translate-y-4"
                    enter-to-class="opacity-100 transform translate-y-0"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 transform translate-y-0"
                    leave-to-class="opacity-0 transform -translate-y-4"
                  >
                    <form @submit="submitBetaSignup" class="space-y-6" v-show="!submitSuccess">
                      <div>
                        <input 
                          v-model="email"
                          type="email" 
                          placeholder="Enter your email address" 
                          class="w-full px-6 py-4 border-2 border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-white placeholder-slate-400 bg-slate-700/80 backdrop-blur-sm"
                          :disabled="isSubmitting"
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="isSubmitting" class="flex items-center justify-center space-x-3">
                          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          <span>Joining Beta...</span>
                        </span>
                        <span v-else>Join Beta Program</span>
                      </button>
                    </form>
                  </transition>

                  <!-- Success state with enhanced animation -->
                  <transition 
                    enter-active-class="transition-all duration-700 ease-out"
                    enter-from-class="opacity-0 transform scale-75 translate-y-8"
                    enter-to-class="opacity-100 transform scale-100 translate-y-0"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 transform scale-100 translate-y-0"
                    leave-to-class="opacity-0 transform scale-75 -translate-y-8"
                  >
                    <div v-if="submitSuccess" class="text-center space-y-6">
                      <!-- Success icon -->
                      <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      
                      <div class="space-y-4">
                        <h4 class="text-3xl font-bold text-white">Welcome to the Beta!</h4>
                        <p class="text-slate-300 text-lg">You'll be among the first to experience BrewTokens</p>
                      </div>
                      
                      <button 
                        @click="submitSuccess = false; submitMessage = ''"
                        class="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                      >
                        Add another email?
                      </button>
                    </div>
                  </transition>

                  <!-- Footer text with enhanced styling -->
                  <transition 
                    enter-active-class="transition-all duration-500 ease-out delay-300"
                    enter-from-class="opacity-0 translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                  >
                    <div class="text-center space-y-2" v-show="!submitSuccess">
                      <p class="text-slate-400 font-medium">Free for TriviaRat users</p>
                      <p class="text-slate-500 text-sm">Early access guaranteed</p>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div class="flex flex-col items-center space-y-2 text-slate-400">
          <span class="text-sm font-medium">Scroll to explore</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="relative">
      <!-- About Section -->
      <section id="about" class="py-32 relative bg-slate-900">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/2 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 left-1/4 w-80 h-80 bg-slate-500/2 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-6xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-20" data-aos="fade-up">
              <h2 class="font-display text-5xl md:text-6xl font-bold mb-8 tracking-tight">
                <span class="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">About</span>
                <span class="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> BrewTokens</span>
              </h2>
              <p class="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Revolutionizing brewery customer engagement through innovative rewards technology
              </p>
            </div>

            <!-- Main Content Card -->
            <div class="backdrop-blur-xl bg-slate-800/80 border border-slate-600/10 rounded-3xl shadow-xl p-12 mb-16" data-aos="fade-up" data-aos-delay="100">
              <div class="max-w-4xl mx-auto text-center">
                <p class="text-2xl leading-relaxed text-slate-200 font-medium">
                  A comprehensive reward program designed specifically for breweries to engage customers through points, special events, and customizable experiences that drive loyalty and repeat business.
                </p>
              </div>
            </div>

            <!-- Features Grid -->
            <div class="grid lg:grid-cols-2 gap-12">
              <div 
                class="group backdrop-blur-xl bg-slate-800/70 border border-slate-600/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <div class="flex items-start space-x-8">
                  <div class="flex-shrink-0">
                    <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <img 
                        :src="brewery2" 
                        alt="Brewery Scene" 
                        class="w-12 h-12 rounded-xl object-cover"
                      />
                    </div>
                  </div>
                  <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-white">Customizable Branding</h3>
                    <p class="text-slate-200 leading-relaxed text-lg">
                      Each brewery gets their own branded experience with custom colors, logos, and messaging that reflects their unique identity and creates a personalized connection with customers.
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                class="group backdrop-blur-xl bg-slate-800/70 border border-slate-600/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-left"
                data-aos-delay="300"
              >
                <div class="flex items-start space-x-8">
                  <div class="flex-shrink-0">
                    <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <img 
                        :src="brewery3" 
                        alt="QR Code System" 
                        class="w-12 h-12 rounded-xl object-cover"
                      />
                    </div>
                  </div>
                  <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-white">Smart QR System</h3>
                    <p class="text-slate-200 leading-relaxed text-lg">
                      Seamless point redemption through our intelligent QR code system with built-in daily limits and fraud protection, making rewards both secure and effortless for customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="features" class="py-32 relative bg-slate-800">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/3 left-1/3 w-72 h-72 bg-slate-500/2 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/2 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-7xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-20" data-aos="fade-up">
              <h2 class="font-display text-5xl md:text-6xl font-bold mb-8 tracking-tight">
                <span class="bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">How It</span>
                <span class="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent"> Works</span>
              </h2>
              <p class="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Simple, secure, and scalable rewards system designed for modern breweries
              </p>
            </div>

            <!-- QR Code Feature -->
            <div class="mb-32">
              <div class="grid lg:grid-cols-2 gap-16 items-center">
                <div class="space-y-8" data-aos="fade-right" data-aos-delay="100">
                  <div class="space-y-6">
                    <h3 class="font-display text-4xl md:text-5xl font-bold text-white">Smart QR System</h3>
                    <p class="text-xl text-slate-200 leading-relaxed">
                      No complex POS integration required. Simply present QR codes for customers to scan and instantly earn points. Works with printed codes or digital displays.
                    </p>
                  </div>
                  
                  <div class="backdrop-blur-xl bg-slate-700/80 border border-slate-600/10 rounded-2xl p-8 shadow-lg">
                    <div class="flex items-center space-x-4 mb-4">
                      <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Smart Security</h4>
                    </div>
                    <p class="text-slate-200 leading-relaxed">
                      Built-in daily limits and fraud protection ensure fair usage while preventing system abuse
                    </p>
                  </div>
                </div>
                
                <div class="relative" data-aos="fade-left" data-aos-delay="200">
                  <div class="relative group">
                    <img 
                      :src="qrCodeImage" 
                      alt="QR Code Scanning" 
                      class="w-full max-w-md mx-auto rounded-3xl shadow-2xl transition-transform duration-500"
                    />
                    <div class="absolute -bottom-8 -right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-2xl">
                      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Points Tracking Feature -->
            <div>
              <div class="grid lg:grid-cols-2 gap-16 items-center">
                <div class="relative" data-aos="fade-right" data-aos-delay="300">
                  <div class="relative group">
                    <img 
                      :src="earnedImage" 
                      alt="Points Earned" 
                      class="w-full max-w-lg mx-auto rounded-3xl shadow-2xl transition-transform duration-500"
                    />
                    <div class="absolute -top-8 -left-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl">
                      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-8" data-aos="fade-left" data-aos-delay="400">
                  <div class="space-y-6">
                    <h3 class="font-display text-4xl md:text-5xl font-bold text-white">Track & Grow</h3>
                    <p class="text-xl text-slate-200 leading-relaxed">
                      Customers watch their rewards accumulate in real-time, creating excitement and driving repeat visits. Flexible point systems adapt to your brewery's unique needs.
                    </p>
                  </div>
                  
                  <div class="space-y-6">
                    <div class="backdrop-blur-xl bg-slate-700/80 border border-slate-600/10 rounded-2xl p-8 shadow-lg">
                      <div class="flex items-center space-x-4 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </div>
                        <h4 class="text-xl font-bold text-white">Flexible Rewards</h4>
                      </div>
                      <p class="text-slate-200 leading-relaxed">
                        Set custom point values for different activities, events, and purchases to match your brewery's unique offerings
                      </p>
                    </div>
                    
                    <div class="backdrop-blur-xl bg-slate-700/80 border border-slate-600/10 rounded-2xl p-8 shadow-lg">
                      <div class="flex items-center space-x-4 mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                          </svg>
                        </div>
                        <h4 class="text-xl font-bold text-white">Custom Branding</h4>
                      </div>
                      <p class="text-slate-200 leading-relaxed">
                        Each brewery gets their own branded experience with custom colors, logos, and messaging
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      <!-- Brewery Benefits Section -->
      <section id="brewery-benefits" class="py-32 relative bg-slate-900">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/2 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/2 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-7xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-20" data-aos="fade-up">
              <h2 class="font-display text-5xl md:text-6xl font-bold mb-8 tracking-tight">
                <span class="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">Benefits for</span>
                <span class="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> Breweries</span>
              </h2>
              <p class="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Transform your brewery with data-driven insights and customer loyalty
              </p>
            </div>

            <!-- Benefits Grid -->
            <div class="grid lg:grid-cols-3 gap-12">
              <div 
                class="group backdrop-blur-xl bg-slate-800/70 border border-slate-600/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div class="space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-3xl font-bold text-white">Valuable Insights</h3>
                    <p class="text-slate-200 leading-relaxed text-lg">
                      Get comprehensive analytics on customer preferences, visit patterns, and demographics to make data-driven decisions that boost your business.
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                class="group backdrop-blur-xl bg-slate-800/70 border border-slate-600/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div class="space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-3xl font-bold text-white">Return Customers</h3>
                    <p class="text-slate-200 leading-relaxed text-lg">
                      Build lasting loyalty with strategic rewards and promotions. Watch customers return more frequently and spend more with each visit.
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                class="group backdrop-blur-xl bg-slate-800/70 border border-slate-600/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div class="space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-3xl font-bold text-white">Word of Mouth</h3>
                    <p class="text-slate-200 leading-relaxed text-lg">
                      Customers naturally share their rewards and experiences, creating organic marketing that spreads your brewery's reputation far and wide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TriviaRat Partnership Section -->
      <section id="partnership" class="py-20 relative">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/3 left-1/3 w-80 h-80 bg-slate-500/3 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-6xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-12" data-aos="fade-up">
              <h2 class="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                <span class="bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">Partnership with</span>
                <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> TriviaRat</span>
              </h2>
              <p class="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Exclusive benefits for TriviaRat users
              </p>
            </div>

            <!-- Partnership Card -->
            <div class="backdrop-blur-xl bg-white/80 border border-white/10 rounded-2xl shadow-lg p-8" data-aos="fade-up" data-aos-delay="100">
              <div class="flex flex-col lg:flex-row items-center gap-8">
                <div class="flex-shrink-0">
                  <div class="relative group">
                    <img 
                      :src="triviaratLogo" 
                      alt="TriviaRat Logo" 
                      class="w-24 h-24 rounded-2xl shadow-lg transition-transform duration-500"
                    />
                    <div class="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div class="flex-1 text-center lg:text-left space-y-6">
                  <div class="space-y-4">
                    <h3 class="font-display text-2xl md:text-3xl font-bold text-slate-800">
                      Free for TriviaRat Users!
                    </h3>
                    <p class="text-lg text-slate-600 leading-relaxed">
                      If you already have a TriviaRat account, BrewTokens is completely free to use! 
                      Enjoy all the benefits of our brewery rewards program at no additional cost.
                    </p>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a 
                      href="#join-beta" 
                      class="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                      <span>Join Beta</span>
                      <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                      </svg>
                    </a>
                    <a 
                      href="https://triviarat.com" 
                      target="_blank"
                      class="inline-flex items-center justify-center space-x-2 bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-blue-300 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg backdrop-blur-sm"
                    >
                      <span>Learn About TriviaRat</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Coming Soon Section -->
      <section id="join-beta" class="py-32 relative">
        <!-- Background elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/3 rounded-full blur-3xl"></div>
          <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-6xl mx-auto">
            <!-- Section Header -->
            <div class="text-center mb-20" data-aos="fade-up">
              <h2 class="font-display text-5xl md:text-6xl font-bold mb-8 tracking-tight">
                <span class="bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-transparent">Coming</span>
                <span class="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"> Soon</span>
              </h2>
              <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Join our beta program to shape the future of brewery rewards
              </p>
            </div>

            <!-- Features Grid -->
            <div class="grid lg:grid-cols-3 gap-12">
              <div 
                class="group backdrop-blur-xl bg-white/70 border border-white/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div class="text-center space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-2xl font-bold text-slate-800">Early Access</h3>
                    <p class="text-slate-600 leading-relaxed text-lg">
                      Be among the first to experience BrewTokens when we launch
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                class="group backdrop-blur-xl bg-white/70 border border-white/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div class="text-center space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-2xl font-bold text-slate-800">Free for TriviaRat Users</h3>
                    <p class="text-slate-600 leading-relaxed text-lg">
                      Already have TriviaRat? BrewTokens is completely free!
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                class="group backdrop-blur-xl bg-white/70 border border-white/10 rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-500"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div class="text-center space-y-8">
                  <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transition-transform duration-300">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="space-y-4">
                    <h3 class="font-display text-2xl font-bold text-slate-800">Launch Updates</h3>
                    <p class="text-slate-600 leading-relaxed text-lg">
                      Get notified when we're ready to launch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="py-20 relative">
      <!-- Background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-500/3 rounded-full blur-3xl"></div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="backdrop-blur-xl bg-white/80 border border-white/10 rounded-3xl shadow-xl p-12">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div class="space-y-6">
              <h3 class="font-display text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">BrewTokens</h3>
              <p class="text-slate-600 text-lg leading-relaxed">Brewery rewards made simple and effective.</p>
            </div>
            <div class="space-y-6">
              <h4 class="font-display text-xl font-semibold text-slate-800">Quick Links</h4>
              <div class="space-y-4">
                <a href="#about" class="block text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2">About</a>
                <a href="#features" class="block text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2">Features</a>
                <a href="#brewery-benefits" class="block text-slate-600 hover:text-blue-600 transition-all duration-300 hover:translate-x-2">For Breweries</a>
              </div>
            </div>
            <div class="space-y-6">
              <h4 class="font-display text-xl font-semibold text-slate-800">Contact</h4>
              <div class="space-y-4 text-slate-600 text-lg">
                <p class="hover:text-blue-600 transition-colors duration-300 cursor-pointer inline-block">brewtokens@triviarat.com</p>
              </div>
            </div>
            <div class="space-y-6">
              <h4 class="font-display text-xl font-semibold text-slate-800">Follow Us</h4>
              <div class="flex space-x-6">
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-all duration-300">
                  <span class="sr-only">Facebook</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-all duration-300">
                  <span class="sr-only">Instagram</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-all duration-300">
                  <span class="sr-only">Twitter</span>
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="border-t border-slate-200 pt-8 text-center">
            <p class="text-slate-600 text-lg">&copy; {{ currentYear }} BrewTokens. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-5px); }
  75% { transform: translateY(-30px) translateX(15px); }
}

@keyframes float-medium {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-15px) translateX(8px); }
  66% { transform: translateY(-25px) translateX(-12px); }
}

@keyframes float-fast {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-10px) translateX(5px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes pulse-medium {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 6s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 4s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-pulse-medium {
  animation: pulse-medium 3s ease-in-out infinite;
}

/* Glass morphism effects */
.glass-clean {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #1e40af);
}
</style>