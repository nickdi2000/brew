import { computed } from 'vue';

export function useApiUrl() {
  const baseUrl = computed(() => import.meta.env.VITE_API_URL || 'http://localhost:3391/api');

  const getProfilePictureUrl = (userId) => {
    if (!userId) return '';
    return `${baseUrl.value}/users/${userId}/picture`;
  };

  return {
    baseUrl,
    getProfilePictureUrl
  };
}
