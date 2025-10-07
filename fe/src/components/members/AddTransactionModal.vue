<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')" />

      <!-- Modal panel -->
      <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
          <button
            type="button"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            @click="$emit('close')"
          >
            <span class="sr-only">Close</span>
            <Icon icon="mdi:close" class="h-6 w-6" />
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Add Transaction
            </h3>

            <!-- small amber alert box -->
            <div class="mt-4 bg-amber-50/50 border border-amber-500/30 rounded-lg p-4">
              <p class="text-sm text-amber-500">
                Note: Generally you will not need to add transactions manually. They will be created when a member scans a QR code (after a purchase, for example) or when they redeem a reward with their points (subtracted from their balance).
              </p>
            </div>

            <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
              <!-- Transaction Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Transaction Type
                </label>
                <div class="mt-1">
                  <div class="flex space-x-4">
                    <button
                      type="button"
                      @click="formData.type = 'earn'"
                      :class="[
                        'flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
                        formData.type === 'earn'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      ]"
                    >
                      <Icon icon="mdi:plus-circle" class="h-5 w-5 mr-2" />
                      Add Points
                    </button>
                    <button
                      type="button"
                      @click="formData.type = 'adjust'"
                      :class="[
                        'flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
                        formData.type === 'adjust'
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      ]"
                    >
                      <Icon icon="mdi:minus-circle" class="h-5 w-5 mr-2" />
                      Deduct Points
                    </button>
                  </div>
                </div>
              </div>

              <!-- Points Amount -->
              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700">
                  Points Amount
                </label>
                <div class="mt-1">
                  <input
                    type="number"
                    id="amount"
                    v-model.number="formData.amount"
                    min="1"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    :placeholder="formData.type === 'earn' ? 'Enter points to add' : 'Enter points to deduct'"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div class="mt-1">
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    placeholder="Enter a description for this transaction"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-400" />
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">
                      {{ error }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  :disabled="loading"
                  class="btn btn-primary w-full sm:ml-3 sm:w-auto"
                >
                  <span v-if="loading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                  <span v-else>
                    Add Transaction
                  </span>
                </button>
                <button
                  type="button"
                  class="btn btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
                  @click="$emit('close')"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'transaction-added']);

const loading = ref(false);
const error = ref(null);
const formData = ref({
  type: 'earn',
  amount: null,
  description: '',
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Validate amount
    if (!formData.value.amount || formData.value.amount <= 0) {
      error.value = 'Please enter a valid points amount';
      return;
    }

    // Prepare transaction data
    const transactionData = {
      amount: formData.value.type === 'earn' ? formData.value.amount : -formData.value.amount,
      type: formData.value.type,
      method: 'manual', // This is an admin-initiated transaction
      metadata: {
        description: formData.value.description || undefined
      }
    };

    // Emit the event with transaction data
    emit('transaction-added', transactionData);
    
    // Reset form
    formData.value = {
      type: 'earn',
      amount: null,
      description: '',
    };
    
    // Close modal
    emit('close');
  } catch (err) {
    error.value = err.message || 'Failed to add transaction';
  } finally {
    loading.value = false;
  }
};
</script>
