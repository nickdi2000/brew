<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ member ? 'Edit Member' : 'Add New Member' }}
            </h3>
            <div class="mt-4">
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="formData.firstName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      v-model="formData.lastName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                <!-- Contact Information -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="formData.email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>

       

                <!-- Membership Information -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <!-- <div>
                    <label for="membershipLevel" class="block text-sm font-medium text-gray-700">Membership Level</label>
                    <select
                      id="membershipLevel"
                      v-model="formData.membershipLevel"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div> -->
                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <div class="mt-1 flex rounded-md shadow-sm" role="group" aria-label="Member status">
                      <button
                        type="button"
                        @click="formData.status = 'active'"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'active'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:check-circle" class="h-4 w-4 mr-2" :class="formData.status === 'active' ? 'text-white' : 'text-gray-400'" />
                        Active
                      </button>
                      <button
                        type="button"
                        @click="formData.status = 'inactive'"
                        :class="[
                          'relative -ml-px inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'inactive'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:pause-circle" class="h-4 w-4 mr-2" :class="formData.status === 'inactive' ? 'text-white' : 'text-gray-400'" />
                        Inactive
                      </button>
                      <button
                        type="button"
                        @click="formData.status = 'suspended'"
                        :class="[
                          'relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500',
                          formData.status === 'suspended'
                            ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <Icon icon="mdi:block-helper" class="h-4 w-4 mr-2" :class="formData.status === 'suspended' ? 'text-white' : 'text-gray-400'" />
                        Suspended
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Points -->
                <div v-if="member">
                  <label for="points" class="block text-sm font-medium text-gray-700">Points</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      id="points"
                      v-model.number="formData.points"
                      min="0"
                      class="flex-1 min-w-0 block w-full rounded-none rounded-l-md border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      @click="adjustPoints('add')"
                      class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <Icon icon="mdi:plus" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span>Add Points</span>
                    </button>
                  </div>
                </div>

                <!-- Password (only for new members) -->
                <div v-if="!member">
                  <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    v-model="formData.password"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>

                <!-- Error Message -->
                <div v-if="error" class="rounded-md bg-red-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <Icon icon="mdi:close-circle" class="h-5 w-5 text-red-400" aria-hidden="true" />
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
                    class="btn btn-primary w-full sm:ml-3 sm:w-auto"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                    <span v-else>
                      {{ member ? 'Save Changes' : 'Create Member' }}
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  member: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  membershipLevel: 'bronze',
  status: 'active',
  points: 0,
  password: ''
});

const loading = ref(false);
const error = ref(null);

const initForm = () => {
  if (props.member) {
    formData.value = {
      firstName: props.member.firstName,
      lastName: props.member.lastName,
      email: props.member.email,
      phoneNumber: props.member.phoneNumber || '',
      membershipLevel: props.member.membershipLevel,
      status: props.member.status,
      points: props.member.points
    };
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      membershipLevel: 'bronze',
      status: 'active',
      points: 0,
      password: ''
    };
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    await emit('save', formData.value);
  } catch (err) {
    error.value = err.message || 'An error occurred while saving the member.';
  } finally {
    loading.value = false;
  }
};

const store = useStore();

const adjustPoints = async (operation) => {
  const points = parseInt(prompt('Enter points to add:', '0'));
  if (!isNaN(points) && points > 0) {
    try {
      loading.value = true;
      error.value = null;
      const success = await store.dispatch('members/updateMemberPoints', {
        id: props.member._id,
        points,
        operation
      });
      if (success) {
        formData.value.points = operation === 'add'
          ? formData.value.points + points
          : Math.max(0, formData.value.points - points);
      }
    } catch (err) {
      error.value = 'Failed to update points';
    } finally {
      loading.value = false;
    }
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    initForm();
  }
});

onMounted(() => {
  if (props.show) {
    initForm();
  }
});
</script>
