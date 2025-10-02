<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Two column layout when preview is hidden -->
      <div v-if="!showPreview" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Organization Name</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            id="website"
            v-model="formData.website"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Support Email (optional)</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            
          />
        </div>

        <div>
          <label for="orgCode" class="block text-sm font-medium text-gray-700">Organization Code</label>
          <div class="mt-1">
            <div class="flex items-center rounded-md shadow-sm bg-gray-50 border border-gray-300">
              <span class="px-3 py-2 text-gray-500 text-sm border-r border-gray-300">{{ baseUrl }}/members/</span>
              <input
                type="text"
                id="orgCode"
                v-model="formData.code"
                class="flex-1 bg-white rounded-r-md border-0 focus:ring-amber-500 sm:text-sm"
                placeholder="your-brewery-name"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
            {{ baseUrl }}/members/{{ formData.code }}
            </p>
          </div>
        </div>
      </div>

      <!-- Single column layout when preview is shown -->
      <div v-else class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Organization Name</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            id="website"
            v-model="formData.website"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Support Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <!-- Description field - always full width -->
      <div>
        <div class="flex justify-between items-center">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <span class="text-sm text-gray-500" :class="{ 'text-red-500': formData.description.length > 152 }">
            {{ formData.description.length }}/152
          </span>
        </div>
        <textarea
          id="description"
          v-model="formData.description"
          maxlength="152"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          rows="3"
          :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': formData.description.length > 152 }"
        ></textarea>
      </div>

      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">Banner Image</label>
        
        <!-- Image Preview -->
        <div v-if="formData.bannerImage && !showImageOptions" class="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            :src="formData.bannerImage" 
            class="w-full h-full object-cover"
            alt="Banner preview"
          />
          <button
            type="button"
            @click="showImageOptions = true"
            class="absolute bottom-2 right-2 btn btn-primary"
          >
            Change Image
          </button>
        </div>

        <!-- Image Options -->
        <div v-if="showImageOptions" class="space-y-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Add Banner Image</h3>
            
            <!-- URL Input Section -->
            <div class="mb-6">
              <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  id="imageUrl"
                  v-model="imageUrl"
                  class="flex-1 rounded-md border-gray-300 focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  @click="setImageUrl"
                  class="ml-3 btn btn-primary"
                  :disabled="!imageUrl"
                >
                  Set URL
                </button>
              </div>
            </div>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white px-3 text-sm text-gray-500">or</span>
              </div>
            </div>

            <!-- Upload Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Upload Image</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-amber-500 cursor-pointer bg-gray-50"
                   @click="$refs.fileInput.click()"
                   @dragover.prevent
                   @drop.prevent="handleFileDrop">
                <div class="space-y-1 text-center">
                  <Icon icon="mdi:cloud-upload" class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="flex text-sm text-gray-600">
                    <label class="relative cursor-pointer rounded-md font-medium text-amber-600 hover:text-amber-500">
                      <span>Upload a file</span>
                      <input
                        ref="fileInput"
                        type="file"
                        class="sr-only"
                        accept="image/*"
                        @change="handleFileUpload"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelImageUpload"
              class="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Add Image Button -->
        <div v-if="!formData.bannerImage && !showImageOptions" class="flex justify-center">
          <button
            type="button"
            @click="showImageOptions = true"
            class="btn btn-primary"
          >
            <Icon icon="mdi:image-plus" class="h-5 w-5 mr-2" />
            Add Banner Image
          </button>
        </div>
      </div>

      <!-- URL Preview - only show when preview is shown -->
      <div v-if="showPreview">
        <label class="block text-sm font-medium text-gray-700 mb-2">Member Portal URL</label>
        <div class="space-y-4">
          <!-- URL Preview -->
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex items-center space-x-3">
              <Icon icon="mdi:link-variant" class="h-5 w-5 text-gray-400" />
              <div class="flex-grow">
                <p class="text-sm text-gray-600">Your Member Portal URL:</p>
                <div v-if="formData.code">
                <a 
                  
                  :href="memberPortalUrl" 
                  target="_blank" 
                  class="text-amber-600 hover:text-amber-700 font-medium break-all"
                >
                  {{ memberPortalUrl }}
                </a>
                <div>
                  <router-link 
                    :to="{ name: 'qr-codes' }" 
                    class="btn btn-secondary btn-sm mt-3"
                  >
                    View QR Code
                    <Icon icon="mdi:arrow-right" class="ml-1 h-4 w-4" />
                  </router-link>
                </div>
                </div>
                <p v-else class="text-gray-400 italic">Enter a code above to generate your URL</p>
              </div>
            </div>
          </div>
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
          :disabled="loading || !isDescriptionValid"
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
import { Icon } from '@iconify/vue';
import { uploadOrganizationBanner } from '../../api';
import { useToast } from '../../plugins/toast';

const router = useRouter();
const toast = useToast();
const props = defineProps({
  organization: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  showPreview: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'update:preview']);

const formData = ref({
  name: '',
  description: '',
  website: '',
  email: '',
  code: '',
  bannerImage: ''
});

const showImageOptions = ref(false);
const imageUrl = ref('');
const fileInput = ref(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast('File size must be less than 10MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const response = await uploadOrganizationBanner(e.target.result);
        formData.value.bannerImage = response.data.data.bannerImage;
        showImageOptions.value = false;
        toast('Banner image uploaded successfully', 'success');
      } catch (error) {
        console.error('Error uploading banner image:', error);
        toast('Failed to upload banner image', 'error');
      }
    };
    reader.readAsDataURL(file);
  }
};

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const input = fileInput.value;
    input.files = event.dataTransfer.files;
    handleFileUpload({ target: input });
  }
};

const setImageUrl = async () => {
  if (imageUrl.value) {
    try {
      const response = await uploadOrganizationBanner(imageUrl.value);
      formData.value.bannerImage = response.data.data.bannerImage;
      showImageOptions.value = false;
      imageUrl.value = '';
      toast('Banner image URL set successfully', 'success');
    } catch (error) {
      console.error('Error setting banner image URL:', error);
      toast('Failed to set banner image URL', 'error');
    }
  }
};

const cancelImageUpload = () => {
  showImageOptions.value = false;
  imageUrl.value = '';
};

const baseUrl = computed(() => {
  return typeof window !== 'undefined' ? window.location.origin : '';
});

const memberPortalUrl = computed(() => {
  return formData.value.code ? `${baseUrl.value}/members/${formData.value.code}` : '';
});

// Watch for changes in the organization prop and update form data
watch(() => props.organization, (newOrg) => {
  console.log('👀 Organization prop changed:', newOrg);
  if (newOrg) {
    formData.value = {
      name: newOrg.name || '',
      description: newOrg.description || '',
      website: newOrg.website || '',
      email: newOrg.email || '',
      code: newOrg.code || '',
      bannerImage: newOrg.bannerImage || ''
    };
    console.log('📝 Updated form data:', formData.value);
  }
}, { immediate: true, deep: true });

// Watch for form data changes and emit preview updates
watch(formData, (newData) => {
  emit('update:preview', {
    name: newData.name,
    description: newData.description,
    bannerImage: newData.bannerImage
  });
}, { deep: true, immediate: true });

const isDescriptionValid = computed(() => {
  return formData.value.description.length <= 152;
});

const handleSubmit = () => {
  // Trim the description before submitting
  formData.value.description = formData.value.description.trim();
  
  if (!isDescriptionValid.value) {
    toast('Description must be 65 characters or less', 'error');
    return;
  }
  
  emit('submit', { ...formData.value });
};

const resetForm = () => {
  if (props.organization) {
    formData.value = {
      name: props.organization.name || '',
      description: props.organization.description || '',
      website: props.organization.website || '',
      email: props.organization.email || '',
      code: props.organization.code || '',
      bannerImage: props.organization.bannerImage || ''
    };
  }
};

const navigateToMemberConfig = () => {
  router.push({ name: 'qr-codes' });
};
</script>
