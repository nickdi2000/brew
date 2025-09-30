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
    
    <!-- Main epic content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <!-- Massive CoinFlip at the top -->
      <div class="mb-8 md:mb-16 transform hover:scale-110 transition-all duration-500 drop-shadow-2xl">
        <div class="scale-150 md:scale-200">
          <CoinFlip :value="'$'" />
        </div>
      </div>
      
      <!-- Epic welcome content -->
      <div class="text-center max-w-4xl space-y-6 md:space-y-12">
        <!-- Massive heading with epic gradient -->
        <h1 class="text-5xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight tracking-tight">
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
        <p v-if="!hasAttemptedCode" class="text-2xl md:text-3xl text-gray-300 font-light leading-relaxed animate-fade-in-up" style="animation-delay: 0.6s;">
          Transform your venue into a
          <span class="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent font-semibold">rewards destination</span>
        </p>
        
        <!-- Epic call to action -->
        <div class="pt-8 md:pt-16 animate-fade-in-up" style="animation-delay: 0.8s;">
          <button 
            class="group relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-black py-6 px-12 md:py-8 md:px-16 rounded-2xl text-xl md:text-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] focus:outline-none focus:ring-4 focus:ring-amber-500/50 shadow-2xl"
            @click="handleContinue"
          >
            <span class="relative z-10 flex items-center justify-center space-x-3">
              <span>GET STARTED</span>
              <Icon icon="mdi:rocket-launch" class="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
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
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import CoinFlip from '@/components/CoinFlip.vue';

const route = useRoute();
const attemptedCode = ref('');

// Check if we have a code parameter from the Gold route
const hasAttemptedCode = computed(() => !!attemptedCode.value);

const handleContinue = () => {
  // TODO: Add onboarding functionality
  console.log('🚀 Continue button clicked - onboarding flow will be implemented here', {
    attemptedCode: attemptedCode.value
  });
};

onMounted(() => {
  // Get the code from query parameters if it exists
  if (route.query.code) {
    attemptedCode.value = String(route.query.code);
    console.log('📝 Organization onboarding initiated with attempted code:', attemptedCode.value);
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
    font-size: 3rem;
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
</style>
