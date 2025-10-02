<template>
  <div class="w-full space-y-3">
    <div class="text-center">
      <h3 v-if="title" class="text-base font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
    </div>

    <div
      ref="trackRef"
      class="relative flex items-center rounded-full bg-gray-100 shadow-inner overflow-hidden touch-pan-y"
      :class="[
        disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        confirmed && !loading ? 'bg-amber-100' : 'bg-gray-100'
      ]"
      :style="{ height: `${trackHeight}px` }"
      role="button"
      :aria-label="title || label"
      :aria-disabled="disabled || loading"
      @pointerdown="onPointerDown"
    >
      <div
        class="absolute inset-y-0 left-0 bg-amber-500 transition-colors"
        :style="{ width: `${fillWidth}px` }"
      ></div>

      <div class="relative flex-1 flex items-center justify-center pointer-events-none">
        <span
          class="text-sm font-medium transition-colors"
          :class="[
            (confirmed && !loading) || progress >= confirmThreshold ? 'text-amber-700' : 'text-gray-600',
            loading ? 'opacity-70' : 'opacity-100'
          ]"
        >
          {{ currentLabel }}
        </span>
      </div>

      <div
        ref="handleRef"
        class="absolute top-1 bottom-1 left-1 w-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-150 ease-out"
        :class="[
          confirmed && !loading ? 'ring-2 ring-amber-400' : 'ring-0',
          disabled || loading ? 'pointer-events-none' : 'pointer-events-auto'
        ]"
        :style="{ transform: `translateX(${handleOffset}px)` }"
      >
        <Icon
          :icon="loading ? loadingIcon : currentIcon"
          :class="loading ? 'h-5 w-5 animate-spin text-amber-600' : 'h-6 w-6 text-amber-600'"
        />
      </div>
    </div>

    <transition name="fade-slide" mode="out-in">
      <p
        v-if="helperText"
        key="helper"
        class="text-center text-xs text-gray-500"
      >
        {{ helperText }}
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Slide to confirm'
  },
  confirmLabel: {
    type: String,
    default: 'Keep sliding to confirm'
  },
  successLabel: {
    type: String,
    default: 'Confirmed'
  },
  subtitle: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'mdi:arrow-right'
  },
  successIcon: {
    type: String,
    default: 'mdi:check'
  },
  loadingIcon: {
    type: String,
    default: 'mdi:loading'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  helperText: {
    type: String,
    default: ''
  },
  autoReset: {
    type: Boolean,
    default: true
  },
  trackHeight: {
    type: Number,
    default: 60
  }
});

const emit = defineEmits<{
  (event: 'confirm'): void;
}>();

const progress = ref(0);
const confirmed = ref(false);
const pointerId = ref<number | null>(null);
const isDragging = ref(false);
const trackWidth = ref(0);
const handleWidth = ref(0);
const trackRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);

const confirmThreshold = 0.85;
const sidePadding = 8; // matches top/bottom spacing from tailwind `top-1`/`left-1`

const maxOffset = computed(() => Math.max(trackWidth.value - handleWidth.value - sidePadding * 2, 0));

const handleOffset = computed(() => {
  if (confirmed.value && (props.loading || progress.value === 1)) {
    return maxOffset.value;
  }

  return Math.min(maxOffset.value, Math.max(0, progress.value * maxOffset.value));
});

const fillWidth = computed(() => {
  const base = sidePadding + handleWidth.value / 2 + handleOffset.value;
  return base <= 0 ? 0 : Math.min(trackWidth.value, base);
});

const currentIcon = computed(() => {
  if (confirmed.value && !props.loading) {
    return props.successIcon;
  }

  if (progress.value >= confirmThreshold && !props.loading) {
    return props.successIcon;
  }

  return props.icon;
});

const currentLabel = computed(() => {
  if (props.loading) {
    return 'Processing...';
  }

  if (confirmed.value) {
    return props.successLabel;
  }

  if (progress.value >= confirmThreshold) {
    return props.confirmLabel;
  }

  return props.label;
});

const updateMeasurements = () => {
  if (!trackRef.value || !handleRef.value) return;
  trackWidth.value = trackRef.value.offsetWidth;
  handleWidth.value = handleRef.value.offsetWidth;
};

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

const updateProgressFromClientX = (clientX: number) => {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const relative = clientX - rect.left - sidePadding - handleWidth.value / 2;
  const newProgress = clampProgress(relative / Math.max(maxOffset.value, 1));
  progress.value = newProgress;
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  pointerId.value = null;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);

  if (props.disabled || props.loading) {
    resetSlider();
    return;
  }

  if (progress.value >= confirmThreshold) {
    confirmed.value = true;
    progress.value = 1;
    emit('confirm');
  } else {
    resetSlider();
  }
};

const resetSlider = () => {
  progress.value = 0;
  confirmed.value = false;
};

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value || pointerId.value !== event.pointerId) return;
  event.preventDefault();
  updateProgressFromClientX(event.clientX);
};

const onPointerUp = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId) return;
  event.preventDefault();
  endDrag();
};

const onPointerDown = (event: PointerEvent) => {
  if (props.disabled || props.loading) return;

  if (trackRef.value) {
    try {
      trackRef.value.setPointerCapture(event.pointerId);
    } catch (err) {
      console.debug('Unable to set pointer capture', err);
    }
  }

  updateMeasurements();
  isDragging.value = true;
  pointerId.value = event.pointerId;
  updateProgressFromClientX(event.clientX);

  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
};

watch(
  () => props.loading,
  (newVal, oldVal) => {
    if (!newVal && oldVal && props.autoReset) {
      resetSlider();
    }
  }
);

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      resetSlider();
    }
  }
);

onMounted(() => {
  updateMeasurements();

  resizeObserver.value = new ResizeObserver(() => {
    updateMeasurements();
  });

  if (trackRef.value) {
    resizeObserver.value.observe(trackRef.value);
  }

  window.addEventListener('resize', updateMeasurements);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('resize', updateMeasurements);

  if (resizeObserver.value && trackRef.value) {
    resizeObserver.value.unobserve(trackRef.value);
  }
  resizeObserver.value = null;
});

defineExpose({ resetSlider });
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>

