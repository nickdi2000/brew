<template>
  <Drawer :show="show" @close="$emit('close')">
    <template #header>
      {{ reward ? 'Edit Reward' : 'New Reward' }}
    </template>

    <template #content>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <div class="mt-1">
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <div class="mt-1">
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <!-- Image Upload (moved from Advanced) -->
        <div class="rounded-lg bg-gray-50 p-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Reward Image</label>
            <p class="text-sm text-gray-500">Upload an image for this reward</p>
          </div>

          <!-- Image Preview -->
          <div v-if="form.base64Image" class="mt-3">
            <div class="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img :src="form.base64Image" class="w-full h-full object-cover" alt="Reward preview" />
              <button
                @click="removeImage"
                class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
              >
                <Icon icon="mdi:close" class="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Upload Button -->
          <div v-else class="mt-3">
            <div class="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div class="space-y-1 text-center">
                <Icon icon="mdi:image-plus" class="mx-auto h-12 w-12 text-gray-400" />
                <div class="flex text-sm text-gray-600">
                  <label
                    for="image-upload"
                    class="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image-upload"
                      type="file"
                      class="sr-only"
                      accept="image/*"
                      @change="handleImageUpload"
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Points Cost -->
        <div>
          <label for="pointsCost" class="block text-sm font-medium text-gray-700">Points Cost</label>
          <div class="mt-1">
            <input
              type="number"
              id="pointsCost"
              v-model.number="form.pointsCost"
              min="0"
              class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <!-- Status -->
        <div>
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <button
              type="button"
              :class="[
                form.isActive ? 'bg-amber-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
              ]"
              role="switch"
              :aria-checked="form.isActive"
              @click="form.isActive = !form.isActive"
            >
              <span class="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                :class="[
                  form.isActive ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                ]"
              />
            </button>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            {{ form.isActive ? 'Reward is active and available' : 'Reward is inactive' }}
          </p>
        </div>

        <!-- Advanced Fields Toggle -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Icon
                :icon="showAdvanced ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                class="h-4 w-4 text-gray-400"
              />
              Advanced Options
            </button>
          </div>
        </div>

        <!-- Advanced Fields -->
        <div v-if="showAdvanced" class="space-y-6">
          <!-- Type (moved to Advanced) -->
          <div class="rounded-lg bg-gray-50 p-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
            </div>
            <div class="mt-3">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in rewardTypes"
                  :key="type"
                  type="button"
                  class="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  :class="[
                    form.type === type
                      ? 'border-amber-600 bg-amber-50 text-amber-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                  @click="form.type = type"
                >
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Stock -->
          <div class="rounded-lg bg-gray-50 p-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-gray-700">Stock</label>
                <p class="text-sm text-gray-500">
                  {{ isUnlimited ? 'Unlimited stock available' : 'Limited stock' }}
                </p>
              </div>
              <button
                type="button"
                :class="[
                  isUnlimited ? 'bg-amber-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
                ]"
                role="switch"
                :aria-checked="isUnlimited"
                @click="isUnlimited = !isUnlimited"
              >
                <span class="sr-only">Unlimited stock</span>
                <span
                  aria-hidden="true"
                  :class="[
                    isUnlimited ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  ]"
                />
              </button>
            </div>
            <div v-if="!isUnlimited" class="mt-3">
              <input
                type="number"
                id="quantity"
                v-model.number="form.quantity"
                min="0"
                class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          <!-- Expiry -->
          <div class="rounded-lg bg-gray-50 p-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-gray-700">Expiry</label>
                <p class="text-sm text-gray-500">
                  {{ isIndefinite ? 'Reward never expires' : 'Reward has expiry date' }}
                </p>
              </div>
              <button
                type="button"
                :class="[
                  isIndefinite ? 'bg-amber-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
                ]"
                role="switch"
                :aria-checked="isIndefinite"
                @click="isIndefinite = !isIndefinite"
              >
                <span class="sr-only">No expiry</span>
                <span
                  aria-hidden="true"
                  :class="[
                    isIndefinite ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  ]"
                />
              </button>
            </div>
            <div v-if="!isIndefinite" class="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
                <div class="mt-1">
                  <input
                    type="date"
                    id="startDate"
                    v-model="form.startDate"
                    class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
                <div class="mt-1">
                  <input
                    type="date"
                    id="endDate"
                    v-model="form.endDate"
                    class="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </form>
    </template>

    <template #footer>
      <button
        type="button"
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        @click="handleSubmit"
      >
        Save
      </button>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import Drawer from '@/components/Drawer.vue';
import type { Reward, RewardType } from '@/types/reward';
import { compressImage, isValidImage, formatFileSize } from '@/utils/imageUtils';
import { useToast } from '@/plugins/toast';

const props = defineProps<{
  show: boolean;
  reward?: Reward;
  initialData?: Partial<Reward>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: Partial<Reward>): void;
}>();

const rewardTypes: RewardType[] = ['product', 'service', 'discount', 'experience'];

const form = ref({
  name: '',
  description: '',
  type: 'product' as RewardType,
  pointsCost: 0,
  quantity: 0,
  isActive: true,
  startDate: '',
  endDate: '',
  base64Image: ''
});

const showAdvanced = ref(false);
const isIndefinite = ref(true);

const isUnlimited = ref(false);

// Watch for unlimited toggle
watch(isUnlimited, (value) => {
  form.value.quantity = value ? null : 0;
});

// Watch for indefinite toggle
watch(isIndefinite, (value) => {
  if (value) {
    form.value.startDate = '';
    form.value.endDate = '';
  }
});

// Watch for reward prop changes
watch(() => [props.reward, props.initialData], ([newReward, initialData]) => {
  if (newReward) {
    form.value = {
      name: newReward.name,
      description: newReward.description,
      type: newReward.type,
      pointsCost: newReward.pointsCost,
      quantity: newReward.quantity,
      isActive: newReward.isActive,
      startDate: newReward.startDate || '',
      endDate: newReward.expiresAt ? new Date(newReward.expiresAt).toISOString().split('T')[0] : '',
      base64Image: newReward.base64Image || ''
    };
    isUnlimited.value = newReward.quantity === null;
    isIndefinite.value = !newReward.expiresAt;
  } else if (initialData) {
    form.value = {
      name: initialData.name ?? '',
      description: initialData.description ?? '',
      type: (initialData.type as RewardType) ?? 'product',
      pointsCost: initialData.pointsCost ?? 0,
      quantity: initialData.quantity ?? 0,
      isActive: initialData.isActive ?? true,
      startDate: initialData.startDate ?? '',
      endDate: initialData.endDate ?? '',
      base64Image: initialData.base64Image ?? ''
    };
    isUnlimited.value = initialData.quantity === null;
  } else {
    form.value = {
      name: '',
      description: '',
      type: 'product',
      pointsCost: 0,
      quantity: 0,
      isActive: true,
      startDate: '',
      endDate: '',
      base64Image: ''
    };
    isUnlimited.value = false;
  }
}, { immediate: true });

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  
  // Validate file type
  if (!isValidImage(file)) {
    useToast()('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    useToast()('Image size should be less than 5MB', 'error');
    return;
  }

  try {
    // Compress and convert to base64
    const base64String = await compressImage(file);
    form.value.base64Image = base64String;
  } catch (error) {
    useToast()('Failed to process image', 'error');
    console.error('Image processing error:', error);
  }
};

const removeImage = () => {
  form.value.base64Image = '';
};

const handleSubmit = () => {
  const formData = { ...form.value };
  
  // Handle expiry dates
  if (isIndefinite.value) {
    formData.startDate = null;
    formData.endDate = null;
    formData.expiresAt = null;
  } else {
    formData.expiresAt = formData.endDate ? new Date(formData.endDate).toISOString() : null;
  }

  emit('save', formData);
};
</script>
