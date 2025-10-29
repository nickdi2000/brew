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
        :enter-from-class="props.direction === 'left' ? '-translate-x-full' : 'translate-x-full'"
        enter-to-class="translate-x-0"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-from-class="translate-x-0"
        :leave-to-class="props.direction === 'left' ? '-translate-x-full' : 'translate-x-full'"
      >
        <!-- Drawer container -->
        <div class="fixed inset-y-0 max-w-full flex" :class="props.direction === 'left' ? 'left-0 pr-10' : 'right-0 pl-10'">
          <!-- Drawer panel -->
          <div
            class="relative w-screen transform transition-transform duration-300"
            :class="props.width"
            @click.stop
          >
            <div class="h-full flex flex-col shadow-xl" :class="props.bgClass">
              <!-- Header -->
              <div class="flex-shrink-0 px-4 py-6 sm:px-6 border-b" :class="props.headerBorderClass">
                <div class="flex items-start justify-between">
                  <h2 class="text-lg font-medium" :class="props.headerTextClass">
                    <slot name="header" />
                  </h2>
                  <div class="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      class="rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      :class="props.closeButtonClass"
                      @click="$emit('close')"
                    >
                      <span class="sr-only">Close panel</span>
                      <Icon icon="mdi:close" class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-scroll">
                <div class="px-4 py-6 sm:px-6">
                  <slot name="content" />
                </div>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="flex-shrink-0 px-4 py-4 flex justify-end space-x-2 border-t" :class="[props.bgClass, props.headerBorderClass]">
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
  width?: string;
  direction?: 'left' | 'right';
  bgClass?: string;
  headerTextClass?: string;
  headerBorderClass?: string;
  closeButtonClass?: string;
}>(), {
  width: 'max-w-xl',
  direction: 'right',
  bgClass: 'bg-white',
  headerTextClass: 'text-gray-900',
  headerBorderClass: 'border-gray-200',
  closeButtonClass: 'bg-white text-gray-400 hover:text-gray-500'
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