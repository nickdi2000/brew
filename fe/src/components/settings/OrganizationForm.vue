<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Organization Name</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          class="mt-1"
          required
        />
      </div>

 

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          class="mt-1"
          rows="3"
        ></textarea>
      </div>

      <div>
        <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          id="website"
          v-model="formData.website"
          class="mt-1"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Support Email</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          class="mt-1"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Member Portal</label>
        <div class="mt-1 flex items-center space-x-3">
          <a 
            :href="memberPortalUrl" 
            target="_blank" 
            class="text-amber-600 hover:text-amber-700 truncate"
          >
            {{ memberPortalUrl }}
          </a>
          <button
            type="button"
            @click="navigateToMemberConfig"
            class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Edit
          </button>
        </div>
      </div>

      

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="resetForm"
          class="btn btn-secondary"
          :disabled="loading"
        >
          Reset
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  organization: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const formData = ref({
  name: '',
  description: '',
  website: '',
  email: '',
  code: ''
});

const memberPortalUrl = computed(() => {
  return formData.value.code ? `https://${formData.value.code}.brewtokens.com` : '';
});

// Watch for changes in the organization prop and update form data
watch(() => props.organization, (newOrg) => {
  if (newOrg) {
    formData.value = {
      name: newOrg.name || '',
      description: newOrg.description || '',
      website: newOrg.website || '',
      email: newOrg.email || '',
      code: newOrg.code || ''
    };
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('submit', { ...formData.value });
};

const resetForm = () => {
  if (props.organization) {
    formData.value = {
      name: props.organization.name || '',
      description: props.organization.description || '',
      website: props.organization.website || '',
      email: props.organization.email || '',
      code: props.organization.code || ''
    };
  }
};

const navigateToMemberConfig = () => {
  router.push({ name: 'members', query: { tab: 'config' } });
};
</script>
