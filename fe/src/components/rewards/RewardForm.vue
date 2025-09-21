<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" v-if="show">
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <!-- Header -->
          <div class="mb-5">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              {{ reward ? 'Edit Reward' : 'Create New Reward' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ reward ? 'Update the reward details below.' : 'Fill in the reward details below.' }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
                maxlength="100"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                required
                maxlength="500"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Points Cost -->
            <div>
              <label for="pointsCost" class="block text-sm font-medium text-gray-700">Points Cost</label>
              <input
                type="number"
                id="pointsCost"
                v-model.number="formData.pointsCost"
                required
                min="0"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>

            <!-- Type -->
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                v-model="formData.type"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="discount">Discount</option>
                <option value="experience">Experience</option>
              </select>
            </div>

            <!-- Image URL -->
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                v-model="formData.imageUrl"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>

            <!-- Quantity -->
            <div>
              <div class="flex items-center justify-between">
                <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
                <button
                  type="button"
                  class="text-sm text-gray-500 hover:text-gray-700"
                  @click="formData.quantity = formData.quantity === null ? 0 : null"
                >
                  {{ formData.quantity === null ? 'Set Limit' : 'Make Unlimited' }}
                </button>
              </div>
              <input
                type="number"
                id="quantity"
                v-model.number="formData.quantity"
                min="0"
                :disabled="formData.quantity === null"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            <!-- Expiration Date -->
            <div>
              <div class="flex items-center justify-between">
                <label for="expiresAt" class="block text-sm font-medium text-gray-700">Expiration Date</label>
                <button
                  type="button"
                  class="text-sm text-gray-500 hover:text-gray-700"
                  @click="formData.expiresAt = formData.expiresAt ? null : new Date().toISOString().split('T')[0]"
                >
                  {{ formData.expiresAt ? 'Remove Expiration' : 'Set Expiration' }}
                </button>
              </div>
              <input
                type="date"
                id="expiresAt"
                v-model="formData.expiresAt"
                :min="new Date().toISOString().split('T')[0]"
                :disabled="!formData.expiresAt"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            <!-- Redemption Instructions -->
            <div>
              <label for="redemptionInstructions" class="block text-sm font-medium text-gray-700">
                Redemption Instructions
              </label>
              <textarea
                id="redemptionInstructions"
                v-model="formData.redemptionInstructions"
                rows="2"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Terms and Conditions -->
            <div>
              <label for="termsAndConditions" class="block text-sm font-medium text-gray-700">
                Terms and Conditions
              </label>
              <textarea
                id="termsAndConditions"
                v-model="formData.termsAndConditions"
                rows="2"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Active Status -->
            <div class="relative flex items-start">
              <div class="flex h-5 items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  v-model="formData.isActive"
                  class="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="isActive" class="font-medium text-gray-700">Active</label>
                <p class="text-gray-500">Make this reward available for redemption</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                class="inline-flex w-full justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 sm:col-start-2"
                :disabled="loading"
              >
                {{ loading ? 'Saving...' : (reward ? 'Update Reward' : 'Create Reward') }}
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                @click="$emit('close')"
                :disabled="loading"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import type { Reward, RewardFormData } from '@/types/reward';

const store = useStore();

// Props & Emits
const props = defineProps<{
  show: boolean;
  reward?: Reward;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

// State
const loading = ref(false);
const formData = ref<RewardFormData>({
  name: '',
  description: '',
  pointsCost: 0,
  type: 'product',
  imageUrl: '',
  isActive: true,
  quantity: null,
  expiresAt: null,
  redemptionInstructions: '',
  termsAndConditions: ''
});

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    if (props.reward) {
      await store.dispatch('rewards/updateReward', {
        id: props.reward._id,
        data: formData.value
      });
    } else {
      await store.dispatch('rewards/createReward', formData.value);
    }
    
    emit('save');
    emit('close');
  } catch (error) {
    console.error('Failed to save reward:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  if (props.reward) {
    formData.value = {
      name: props.reward.name,
      description: props.reward.description,
      pointsCost: props.reward.pointsCost,
      type: props.reward.type,
      imageUrl: props.reward.imageUrl || '',
      isActive: props.reward.isActive,
      quantity: props.reward.quantity,
      expiresAt: props.reward.expiresAt ? new Date(props.reward.expiresAt).toISOString().split('T')[0] : null,
      redemptionInstructions: props.reward.redemptionInstructions || '',
      termsAndConditions: props.reward.termsAndConditions || ''
    };
  }
});
</script>
