<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Logo and Title Section -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="mb-4">
          <img
            src="/images/brew-tokens-logo.png"
            alt="BrewTokens"
            class="h-14 w-auto mx-auto"
          />
        </div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          BrewTokens
        </h2>
        <p class="text-gray-300 mt-3">
          Enter your brewery code to access your member portal
        </p>
      </div>

      <!-- Code Input Form -->
      <div class="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-6 shadow-xl animate-scale-in">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="code" class="block text-sm font-medium text-gray-300 animate-fade-in-up-delay">
              Brewery Code
            </label>
            <div class="relative">
              <input
                id="code"
                v-model="code"
                type="text"
                placeholder="Enter your brewery code"
                class="w-full px-4 py-3 border border-white/10 rounded-xl bg-slate-950/60 text-white placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-300 transition-all duration-300 text-center text-lg font-medium tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-300': error }"
                @input="clearError"
                ref="codeInput"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <Icon 
                  icon="mdi:beer" 
                  class="h-5 w-5 text-amber-400 animate-pulse" 
                />
              </div>
            </div>
            <p v-if="error" class="text-red-400 text-sm mt-1 animate-shake">
              {{ error }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !code.trim()"
            class="btn btn-primary w-full animate-fade-in-up-delay-2"
          >
            <span v-if="!isLoading" class="flex items-center justify-center space-x-2">
              <Icon icon="mdi:arrow-right" class="h-5 w-5" />
              <span>Access Portal</span>
            </span>
            <span v-else class="flex items-center justify-center space-x-2">
              <Icon icon="mdi:loading" class="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </span>
          </button>
        </form>

        <!-- Help Text -->
        <div class="mt-6 text-center animate-fade-in-delay-3">
          <p class="text-sm text-gray-400">
            Don't have a code? 
            <a href="/" class="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Learn more about BrewTokens
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';

const router = useRouter();
const toast = useToast();
const codeInput = ref(null);

const code = ref('');
const error = ref('');
const isLoading = ref(false);

const clearError = () => {
  if (error.value) {
    error.value = '';
  }
};

const validateCode = (code) => {
  if (!code || !code.trim()) {
    return 'Please enter a brewery code';
  }
  if (code.trim().length < 3) {
    return 'Brewery code must be at least 3 characters';
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(code.trim())) {
    return 'Brewery code can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

const handleSubmit = async () => {
  const validationError = validateCode(code.value);
  if (validationError) {
    error.value = validationError;
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Navigate to the member portal with the code
    await router.push(`/members/${code.value.trim()}`);
  } catch (err) {
    error.value = 'Failed to access portal. Please try again.';
    toast('Failed to access portal', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Focus the input field when component mounts
  if (codeInput.value) {
    codeInput.value.focus();
  }
});
</script>

<style scoped>
/* Animation keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

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

/* Animation classes */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out;
}

.animate-bounce-in {
  animation: bounceIn 1s ease-out;
}

.animate-fade-in-delay {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.animate-fade-in-up-delay {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.animate-fade-in-up-delay-2 {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.animate-fade-in-delay-3 {
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

.animate-fade-in-delay-4 {
  animation: fadeInUp 0.8s ease-out 1s both;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Custom focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* Gradient text animation */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
