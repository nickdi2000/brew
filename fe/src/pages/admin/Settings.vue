<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 text-center">Settings</h1>
      </div>

      <div class="max-w-7xl mx-auto">
        <div class="grid gap-8 grid-cols-1 lg:grid-cols-2 items-start">
          <!-- Settings Form -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6">
              <organization-form 
                :organization="organization"
                :loading="loading"
                :show-preview="true"
                @submit="handleOrganizationUpdate"
                @update:preview="previewData = $event"
              />
            </div>
          </div>

          <!-- Mobile Preview -->
          <div class="flex flex-col items-center">
            <div class="flex items-center justify-between w-full max-w-[380px] mb-4">
              <h2 class="text-lg font-medium text-gray-900">Member Portal Preview</h2>
              <button
                v-if="isPreviewSignedIn"
                @click="isPreviewSignedIn = false"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Icon icon="mdi:refresh" class="h-4 w-4" />
                Reset
              </button>
            </div>
            <div class="relative" style="max-width: 380px;">
              <!-- Phone Frame -->
              <div class="preview-phone relative border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[720px] w-[380px]">
                <div class="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div class="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                
                <!-- Status Bar -->
                <div class="rounded-t-[2rem] overflow-hidden w-[352px] h-[32px] bg-gray-900">
                  <div class="flex items-center justify-between px-4 py-1">
                    <span class="text-white text-xs">9:41</span>
                    <div class="flex items-center space-x-1">
                      <Icon icon="mdi:signal" class="text-white h-4 w-4" />
                      <Icon icon="mdi:wifi" class="text-white h-4 w-4" />
                      <Icon icon="mdi:battery" class="text-white h-4 w-4" />
                    </div>
                  </div>
                </div>

              <!-- Content -->
              <div class="w-[352px] h-[644px] bg-white overflow-hidden select-none" :class="{ 'pointer-events-none': isPreviewSignedIn }">
                <welcome-component-preview
                  v-if="!isPreviewSignedIn"
                  :name="previewData?.name || organization?.name"
                  :description="previewData?.description || organization?.description"
                  :banner-image="previewData?.bannerImage || organization?.bannerImage"
                  @sign-in-complete="handlePreviewSignIn"
                />
                <member-portal-preview
                  v-else
                  :name="previewData?.name || organization?.name"
                  :banner-image="previewData?.bannerImage || organization?.bannerImage"
                />
              </div>

                <!-- Home Indicator -->
                <div class="rounded-b-[2rem] overflow-hidden w-[352px] h-[30px] bg-gray-900 flex items-center justify-center">
                  <div class="w-[120px] h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <div class="text-xs text-gray-400">Last updated: {{ lastUpdated }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { getOrganization, updateOrganization } from '../../api';
import OrganizationForm from '../../components/settings/OrganizationForm.vue';
import WelcomeComponentPreview from '../../components/members/WelcomeComponentPreview.vue';
import MemberPortalPreview from '../../components/members/MemberPortalPreview.vue';
import { Icon } from '@iconify/vue';
import { useToast } from '../../plugins/toast';
const toast = useToast();
const store = useStore();

const organization = ref<any>(null);
const previewData = ref<any>(null);
const loading = ref(false);
const lastUpdatedTime = ref(new Date());
const isPreviewSignedIn = ref(false);

const lastUpdated = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(lastUpdatedTime.value);
});

const fetchOrganization = async () => {
  console.log('🔄 Starting fetchOrganization in Settings.vue');
  loading.value = true;
  try {
    const response = await getOrganization();
    console.log('✅ Organization fetch response:', response);
    organization.value = response.data.data;  // Make sure we get the data from the response
    console.log('📋 Updated organization value:', organization.value);
    lastUpdatedTime.value = new Date();
  } catch (error) {
    console.error('❌ Failed to fetch organization:', error);
    toast('Failed to load organization details', 'error');
  } finally {
    loading.value = false;
  }
};

const handleOrganizationUpdate = async (updatedData) => {
  loading.value = true;
  try {
    // Update through Vuex store to ensure consistency
    await store.dispatch('organization/updateConfig', updatedData);
    
    // Refresh organization data after update
    const response = await store.dispatch('organization/fetchConfig');
    organization.value = response;
    
    lastUpdatedTime.value = new Date();
    toast('Organization details updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update organization:', error);
    toast('Failed to update organization: ' + (error.message || 'Unknown error'), 'error');
  } finally {
    loading.value = false;
  }
};

const handlePreviewSignIn = () => {
  isPreviewSignedIn.value = true;
};

onMounted(() => {
  fetchOrganization();
});
</script>

<style scoped>
/* Disable most interactions in the preview phone, but allow sign-in button when not signed in */
.preview-phone * {
  user-select: none !important;
}

/* Only disable pointer events when signed in */
.pointer-events-none * {
  pointer-events: none !important;
  cursor: default !important;
}
</style>
