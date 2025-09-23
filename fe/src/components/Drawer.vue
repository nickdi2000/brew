<template>
  <Teleport to="body">
    <div v-if="props.show" class="fixed inset-0 overflow-hidden z-50">
      <!-- Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          class="absolute inset-0 bg-black/75 backdrop-blur-sm"
          @click="$emit('close')"
        />
      </Transition>

      <!-- Drawer -->
      <Transition
        enter-active-class="transform transition ease-in-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <!-- Drawer container -->
        <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <!-- Drawer panel -->
          <div
            class="relative w-screen transform transition-transform duration-300"
            :class="props.width"
            @click.stop
          >
            <div class="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
              <!-- Header -->
              <div class="px-4 sm:px-6">
                <div class="flex items-start justify-between">
                  <h2 class="text-lg font-medium text-gray-900">
                    <slot name="header" />
                  </h2>
                  <div class="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      @click="$emit('close')"
                    >
                      <span class="sr-only">Close panel</span>
                      <Icon icon="mdi:close" class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="mt-6 relative flex-1 px-4 sm:px-6">
                <div class="absolute inset-0 px-4 sm:px-6">
                  <slot name="content" />
                </div>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="flex-shrink-0 px-4 py-4 flex justify-end space-x-2 border-t">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = withDefaults(defineProps<{
  show: boolean;
  width?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl';
}>(), {
  width: 'max-w-xl'
});

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-scroll {
  scrollbar-width: thin;
  scrollbar-color: #D1D5DB transparent;
}

.overflow-y-scroll::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-scroll::-webkit-scrollbar-thumb {
  background-color: #D1D5DB;
  border-radius: 3px;
}

.overflow-y-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #9CA3AF;
}
</style>