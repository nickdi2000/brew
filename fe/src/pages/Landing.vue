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
  <div class="min-h-screen bg-white">
    <main>
      <!-- Navigation -->
      <nav class="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center h-20">
            <a href="/" class="text-3xl font-display font-black text-slate-800 transition-colors duration-300">BrewTokens</a>
          
          <!-- Mobile menu button -->
          <button 
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none" 
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
            <a href="#about" class="text-gray-700 hover:text-blue-600 font-accent font-semibold transition-colors duration-300">About</a>
            <a href="#features" class="text-gray-700 hover:text-blue-600 font-accent font-semibold transition-colors duration-300">Features</a>
            <a href="#brewery-benefits" class="text-gray-700 hover:text-blue-600 font-accent font-semibold transition-colors duration-300">For Breweries</a>
            <a href="#partnership" class="text-gray-700 hover:text-blue-600 font-accent font-semibold transition-colors duration-300">Partnership</a>
            <router-link to="/login" class="text-gray-700 hover:text-blue-600 font-accent font-semibold transition-colors duration-300">Login</router-link>
              <a href="#join-beta" class="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 font-accent font-bold overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span class="relative">Join Beta</span>
              </a>
          </div>
        </div>
        
        <!-- Mobile menu -->
        <div 
          v-show="isMenuOpen" 
          class="md:hidden"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a href="#about" class="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100">About</a>
            <a href="#features" class="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100">Features</a>
            <a href="#brewery-benefits" class="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100">For Breweries</a>
            <a href="#partnership" class="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100">Partnership</a>
            <router-link to="/login" class="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-gray-100">Login</router-link>
            <a href="#join-beta" class="block px-3 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300">Join Beta</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative h-[90vh] min-h-[600px] overflow-hidden">
      <div 
        ref="parallaxContainer"
        class="absolute inset-0 will-change-transform"
        style="transform: translate3d(0, 0, 0)"
      >
        <img 
          :src="brewery1" 
          alt="Brewery Interior" 
          class="w-full h-[120%] object-cover"
          loading="eager"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/90"></div>
      <div class="relative container mx-auto px-4 h-full flex items-center">
        <div class="grid lg:grid-cols-2 gap-12 items-center w-full">
          <!-- Left side - Text content -->
          <div class="text-white">
            <h1 class="hero-text font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
              <span class="text-white">Brew</span><span class="text-blue-400">Tokens</span>
            </h1>
            <p class="hero-text font-accent text-xl md:text-2xl mb-8 leading-relaxed font-semibold text-blue-200">
              Brewery Rewards Program
            </p>
            <p class="hero-text font-body text-lg md:text-xl mb-10 leading-relaxed text-slate-200">
              The future of brewery rewards is coming soon. Award points, create loyalty, and watch your brewery thrive!
            </p>
            <div class="hero-text flex flex-col sm:flex-row gap-6">
              <a 
                href="#features" 
                class="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl transition-colors duration-300 text-center font-accent font-medium"
              >
                <span>Learn More</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <!-- Right side - Waitlist form -->
          <div class="hero-text">
            <div class="relative group">
              <!-- Clean glass morphism card -->
              <div class="glass-clean p-8 rounded-2xl transition-all duration-300 hover-lift">
                <!-- Content -->
                <div>
                  <h3 class="font-display text-3xl font-bold mb-4 text-slate-800">Join the Beta</h3>
                  <p class="text-slate-600 mb-8 text-lg font-accent">Be among the first to test BrewTokens before the public launch!</p>
                  
                  <!-- Success/Error Message with enhanced animations -->
                  <transition 
                    enter-active-class="transition-all duration-500 ease-out"
                    enter-from-class="opacity-0 transform scale-95 translate-y-2"
                    enter-to-class="opacity-100 transform scale-100 translate-y-0"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 transform scale-100 translate-y-0"
                    leave-to-class="opacity-0 transform scale-95 translate-y-2"
                  >
                    <div v-if="submitMessage" class="mb-6 p-4 rounded-lg border" :class="{
                      'bg-green-50 text-green-800 border-green-200': submitSuccess,
                      'bg-red-50 text-red-800 border-red-200': !submitSuccess
                    }">
                      <div class="flex items-center space-x-3">
                        <div v-if="submitSuccess" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <div v-else class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </div>
                        <span class="font-medium">{{ submitMessage }}</span>
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
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                          :disabled="isSubmitting"
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="isSubmitting" class="flex items-center justify-center space-x-2">
                          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          <span>Joining...</span>
                        </span>
                        <span v-else>Join Beta</span>
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
                    <div v-if="submitSuccess" class="text-center">
                      <!-- Success icon -->
                      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      
                      <h4 class="text-2xl font-bold text-slate-800 mb-4">Welcome to the Beta Program!</h4>
                      <p class="text-slate-600 mb-6">You'll be among the first to test BrewTokens!</p>
                      
                      <button 
                        @click="submitSuccess = false; submitMessage = ''"
                        class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
                      >
                        Join another email?
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
                    <p class="text-gray-500 text-sm mt-6 text-center" v-show="!submitSuccess">
                      Free for TriviaRat users • Early access guaranteed
                    </p>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
        </svg>
      </div>
    </div>

      <!-- Main Content -->
      <main>
        <!-- About Section -->
      <section id="about" class="py-24 relative">
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900 opacity-90"></div>
        <div class="container mx-auto px-4 relative">
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
              <h2 
                class="font-display text-4xl md:text-5xl font-bold text-center mb-20 tracking-tight text-slate-800"
                data-aos="fade-up"
              >
                About BrewTokens
              </h2>
              <div class="max-w-4xl mx-auto">
                <!-- Introduction Card -->
                <div 
                  class="mb-16 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-8 shadow-lg"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <p class="text-xl leading-relaxed text-slate-700">
                    A reward program for breweries to use with their customers. The customers can earn points by buying beer among other special events and methods that the brewery management can decide on.
                  </p>
                </div>

                <!-- Features Grid -->
                <div class="grid md:grid-cols-2 gap-8">
                  <div 
                    class="flex items-start space-x-6 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-lg"
                    data-aos="fade-right"
                    data-aos-delay="200"
                  >
                    <img 
                      :src="brewery2" 
                      alt="Brewery Scene" 
                      class="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 class="text-xl font-bold mb-2 text-slate-800">Customizable Branding</h3>
                      <p class="text-slate-600">The app can be customized to include branding of their brewery, creating a unique experience for each establishment.</p>
                    </div>
                  </div>
                  <div 
                    class="flex items-start space-x-6 p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-lg"
                    data-aos="fade-left"
                    data-aos-delay="300"
                  >
                    <img 
                      :src="brewery3" 
                      alt="QR Code System" 
                      class="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 class="text-xl font-bold mb-2 text-slate-800">Easy QR Code System</h3>
                      <p class="text-slate-600">The QR code system makes it easy to 'authorize' points. Simply scan to automatically add value to your account with built-in daily limits.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
      <section id="features" class="py-24 relative">
        <div class="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900 opacity-90"></div>
        <div class="container mx-auto px-4 relative">
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
            <h2 
              class="font-display text-5xl md:text-6xl font-bold text-center mb-20 tracking-tight text-slate-800"
              data-aos="fade-up"
            >
              How It Works
            </h2>

            <!-- QR Code Feature -->
            <div class="mb-20">
              <div 
                class="grid lg:grid-cols-2 gap-12 items-center"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div class="order-2 lg:order-1">
                  <h3 class="font-display text-4xl font-bold mb-6 text-slate-800">The Method</h3>
                  <p class="text-xl text-slate-600 leading-relaxed mb-8">
                    No need to integrate with POS. Just whip out the QR code for your customers to scan (via the app). This will verify and award them their points. QR codes can be printed or presented via device. You may even have more than one available for different rewards.
                  </p>
                  <div class="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl shadow-lg border border-slate-100">
                    <p class="text-lg text-slate-600">
                      <span class="font-semibold text-slate-800">Smart Limits:</span> One scan per day ensures fair usage and prevents gaming the system
                    </p>
                  </div>
                </div>
                <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
                  <div class="relative">
                    <img 
                      :src="qrCodeImage" 
                      alt="QR Code Scanning" 
                      class="w-full max-w-sm rounded-2xl shadow-xl"
                    />
                    <div class="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Earned Points Feature -->
            <div>
              <div 
                class="grid lg:grid-cols-2 gap-16 items-center"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div>
                  <div class="relative">
                    <img 
                      :src="earnedImage" 
                      alt="Points Earned" 
                      class="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                    />
                    <div class="absolute -top-6 -left-6 bg-green-600 text-white p-4 rounded-full shadow-xl">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-display text-4xl font-bold mb-6 text-slate-800">Watch the Points Grow</h3>
                  <p class="text-xl text-slate-600 leading-relaxed mb-8">
                    Customers can track their rewards as they accumulate with every visit. Watch as they keep coming back for more, creating lasting brewery loyalty and driving repeat business.
                  </p>
                  <div class="space-y-4">
                    <div class="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl shadow-lg border border-slate-100">
                      <p class="font-semibold text-slate-800">Flexible Rewards</p>
                      <p class="text-slate-600">Brewery management sets point values for activities and events</p>
                    </div>
                    <div class="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl shadow-lg border border-slate-100">
                      <p class="font-semibold text-slate-800">Custom Branding</p>
                      <p class="text-slate-600">Each brewery gets their own branded app experience</p>
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
      <section id="brewery-benefits" class="py-24 relative">
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900 opacity-90"></div>
        <div class="container mx-auto px-4 relative">
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
            <h2 
              class="font-display text-5xl md:text-6xl font-bold text-center mb-20 tracking-tight text-slate-800"
              data-aos="fade-up"
            >
              Benefits for Breweries
            </h2>
            <div class="grid md:grid-cols-3 gap-10">
              <div 
                class="group bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div class="h-16 w-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                  <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="font-display text-2xl font-bold mb-4 text-slate-800">Valuable Insights</h3>
                <p class="text-slate-600 leading-relaxed">Get valuable info and insights into customer behaviors such as what beers they like, when they come, and where they're from.</p>
              </div>
              <div 
                class="group bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div class="h-16 w-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                  <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 class="font-display text-2xl font-bold mb-4 text-slate-800">Return Customers</h3>
                <p class="text-slate-600 leading-relaxed">Encourage return customers with delayed rewards and special promotions. Watch as customers earn points and keep coming back for more, creating lasting brewery loyalty.</p>
              </div>
              <div 
                class="group bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div class="h-16 w-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                  <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                </div>
                <h3 class="font-display text-2xl font-bold mb-4 text-slate-800">Word of Mouth</h3>
                <p class="text-slate-600 leading-relaxed">Inherently spreads your brewery through word of mouth as customers share their rewards and experiences with friends.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TriviaRat Partnership Section -->
      <section id="partnership" class="py-24 relative">
        <div class="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900 opacity-90"></div>
        <div class="container mx-auto px-4 relative">
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
            <h2 
              class="font-display text-5xl md:text-6xl font-bold text-center mb-20 tracking-tight text-slate-800"
              data-aos="fade-up"
            >
              Partnership with TriviaRat
            </h2>
            <div class="max-w-5xl mx-auto">
              <div 
                class="bg-gradient-to-br from-slate-50 to-white p-12 rounded-2xl shadow-lg border border-slate-100"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div class="flex flex-col md:flex-row items-center gap-8">
                  <div class="flex-shrink-0">
                    <img 
                      :src="triviaratLogo" 
                      alt="TriviaRat Logo" 
                      class="w-32 h-32 rounded-xl shadow-md"
                    />
                  </div>
                  <div class="flex-1 text-center md:text-left">
                    <h3 class="font-display text-3xl md:text-4xl font-bold mb-6 text-slate-800">
                      Free for TriviaRat Users!
                    </h3>
                    <p class="text-xl text-slate-600 leading-relaxed mb-8">
                      If you already have a TriviaRat account, BrewTokens is completely free to use! 
                      Enjoy all the benefits of our brewery rewards program at no additional cost.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <a 
                        href="#join-beta" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg text-center font-medium"
                      >
                        Join Beta
                      </a>
                      <a 
                        href="https://triviarat.com" 
                        target="_blank"
                        class="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg text-center font-medium"
                      >
                        Learn About TriviaRat
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Coming Soon Section -->
      <section id="join-beta" class="py-24 relative">
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900 opacity-90"></div>
        <div class="container mx-auto px-4 relative">
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
            <h2 
              class="font-display text-5xl md:text-6xl font-bold mb-8 tracking-tight text-slate-800 text-center"
              data-aos="fade-up"
            >
              Coming Soon
            </h2>
            <p 
              class="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed text-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              BrewTokens is currently in development. Join our beta program above to be among the first to test and shape the future of brewery rewards.
            </p>
            <div 
              class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div class="bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div class="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="font-display text-xl font-bold mb-2 text-slate-800 text-center">Early Access</h3>
                <p class="text-slate-600 text-center">Be among the first to try BrewTokens when we launch</p>
              </div>
              <div class="bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div class="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="font-display text-xl font-bold mb-2 text-slate-800 text-center">Free for TriviaRat Users</h3>
                <p class="text-slate-600 text-center">Already have TriviaRat? BrewTokens is completely free!</p>
              </div>
              <div class="bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div class="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 class="font-display text-xl font-bold mb-2 text-slate-800 text-center">Launch Updates</h3>
                <p class="text-slate-600 text-center">Get notified when we're ready to launch</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="py-16 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900 opacity-90"></div>
      <div class="container mx-auto px-4 relative">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div class="space-y-4">
              <h3 class="font-display text-2xl font-bold text-slate-800">BrewTokens</h3>
              <p class="text-slate-600 text-lg">Brewery rewards made simple.</p>
            </div>
            <div class="space-y-4">
              <h4 class="font-display text-lg font-semibold text-slate-800">Quick Links</h4>
              <div class="space-y-3">
                <a href="#about" class="block text-slate-600 hover:text-blue-600 transition-colors duration-300">About</a>
                <a href="#features" class="block text-slate-600 hover:text-blue-600 transition-colors duration-300">Features</a>
                <a href="#brewery-benefits" class="block text-slate-600 hover:text-blue-600 transition-colors duration-300">For Breweries</a>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="font-display text-lg font-semibold text-slate-800">Contact</h4>
              <div class="space-y-3 text-slate-600 text-lg">
                <p class="hover:text-blue-600 transition-colors duration-300 cursor-pointer">brewtokens@triviarat.com</p>
              </div>
            </div>
            <div class="space-y-4">
              <h4 class="font-display text-lg font-semibold text-slate-800">Follow Us</h4>
              <div class="flex space-x-6">
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-colors duration-300">
                  <span class="sr-only">Facebook</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-colors duration-300">
                  <span class="sr-only">Instagram</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
                <a href="#" class="text-slate-600 hover:text-blue-600 transition-colors duration-300">
                  <span class="sr-only">Twitter</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="border-t border-slate-100 pt-8 text-center">
            <p class="text-slate-600 text-base">&copy; {{ currentYear }} BrewTokens. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>