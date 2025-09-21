<!-- Toast.vue -->
<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'min-w-[300px] p-4 rounded-lg shadow-lg transform transition-all duration-300',
            'flex items-center gap-3',
            typeClasses[toast.type] || typeClasses.info
          ]"
        >
          <div :class="iconClasses[toast.type]">
            <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg v-else-if="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">{{ toast.message }}</div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const toasts = ref([]);
const typeClasses = {
  success: 'bg-green-100 text-green-800 border border-green-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200'
};

const iconClasses = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500'
};

const addToast = (message, type = 'info', duration = 3000) => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// Expose the addToast method to the template
defineExpose({ addToast });
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
