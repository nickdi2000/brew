<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-end z-50" @click.self="closeDrawer">
    <div class="bg-white rounded-l-lg shadow-xl w-full max-w-md h-full overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Edit QR Code' : 'New QR Code' }}</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="closeDrawer">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label for="points" class="block text-sm font-medium text-gray-700 mb-1">Points</label>
          <input id="points" v-model.number="formData.points" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter points value" />
          <p v-if="errors.points" class="text-red-600 text-sm mt-1">{{ errors.points }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div class="flex items-center gap-4">
            <div class="flex items-center">
              <input id="active" type="radio" v-model="formData.isActive" :value="true" class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <label for="active" class="ml-2 text-sm font-medium text-gray-700">Active</label>
            </div>
            <div class="flex items-center">
              <input id="inactive" type="radio" v-model="formData.isActive" :value="false" class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <label for="inactive" class="ml-2 text-sm font-medium text-gray-700">Inactive</label>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6 border-t border-gray-200 flex justify-end gap-2">
        <button class="btn btn-secondary" @click="closeDrawer">Cancel</button>
        <button class="btn btn-primary" @click="saveQRCode" :disabled="hasErrors">{{ isEditing ? 'Update' : 'Create' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  qrCode: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const isEditing = computed(() => !!props.qrCode);
const formData = ref({
  points: 1,
  isActive: true
});
const errors = ref({
  points: ''
});

watch(() => props.qrCode, (newQrCode) => {
  if (newQrCode) {
    formData.value = {
      points: newQrCode.points || 1,
      isActive: newQrCode.isActive !== undefined ? newQrCode.isActive : true
    };
  } else {
    formData.value = {
      points: 1,
      isActive: true
    };
  }
}, { immediate: true });

watch(() => formData.value.points, (newPoints) => {
  if (newPoints < 1) {
    errors.value.points = 'Points must be at least 1';
  } else {
    errors.value.points = '';
  }
});

const hasErrors = computed(() => {
  return !!errors.value.points;
});

const closeDrawer = () => {
  emit('close');
};

const saveQRCode = () => {
  if (!hasErrors.value) {
    emit('save', { ...formData.value, _id: isEditing.value ? props.qrCode._id : undefined });
  }
};
</script>
