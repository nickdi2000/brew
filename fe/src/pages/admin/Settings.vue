<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        <div class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Settings Form -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6">
            <organization-form 
              :organization="organization"
              :loading="loading"
              @submit="handleOrganizationUpdate"
              @update:preview="previewData = $event"
            />
          </div>
        </div>

        <!-- Mobile Preview -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Member Portal Preview</h2>
          <div class="relative mx-auto" style="max-width: 380px;">
            <!-- Phone Frame -->
            <div class="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[720px] w-[380px]">
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
              <div class="w-[352px] h-[644px] bg-white overflow-hidden">
                <welcome-component
                  :name="previewData?.name || organization?.name"
                  :description="previewData?.description || organization?.description"
                  :banner-image="previewData?.bannerImage || organization?.bannerImage"
                  @sign-in="() => {}"
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
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { getOrganization, updateOrganization } from '../../api';
import OrganizationForm from '../../components/settings/OrganizationForm.vue';
import WelcomeComponent from '../../components/members/WelcomeComponent.vue';
import { Icon } from '@iconify/vue';
import { useToast } from '../../plugins/toast';
const toast = useToast();
const store = useStore();

const organization = ref<any>(null);
const previewData = ref<any>(null);
const loading = ref(false);
const lastUpdatedTime = ref(new Date());

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

onMounted(() => {
  fetchOrganization();
});
</script>

<style scoped>
/* No custom styles needed */
</style>
