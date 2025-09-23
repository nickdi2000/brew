import { computed } from 'vue';
import { useStore } from 'vuex';

export function usePortalLink() {
  const store = useStore();
  
  const portalLink = computed(() => {
    const code = store.getters['organization/config'].code;
    return `${window.location.origin}/members/${code}`;
  });

  return {
    portalLink
  };
}
