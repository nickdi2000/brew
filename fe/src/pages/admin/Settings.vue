<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        <div class="text-sm text-gray-500">Last updated: {{ lastUpdated }}</div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6">
          <organization-form 
            :organization="organization"
            :loading="loading"
            @submit="handleOrganizationUpdate"
          />
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getOrganization, updateOrganization } from '../../api';
import OrganizationForm from '../../components/settings/OrganizationForm.vue';
import { getCurrentInstance, ComponentInternalInstance } from 'vue';

const instance = getCurrentInstance();
if (!instance) {
  throw new Error('Component instance is not available');
}
const proxy = instance.proxy!;

const organization = ref<any>(null);
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
  loading.value = true;
  try {
    const response = await getOrganization();
    organization.value = response.data;
    lastUpdatedTime.value = new Date();
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    proxy.$toast('Failed to load organization details', 'error');
  } finally {
    loading.value = false;
  }
};

const handleOrganizationUpdate = async (updatedData) => {
  loading.value = true;
  try {
    await updateOrganization(updatedData);
    organization.value = { ...organization.value, ...updatedData };
    lastUpdatedTime.value = new Date();
    proxy.$toast('Organization details updated successfully', 'success');
  } catch (error) {
    console.error('Failed to update organization:', error);
    proxy.$toast('Failed to update organization details', 'error');
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
