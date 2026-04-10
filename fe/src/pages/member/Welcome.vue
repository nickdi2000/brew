<template>
  <div class="min-h-screen bg-black">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-amber-400 mx-auto"></div>
        <p class="mt-4 text-sm text-white/40">Loading…</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="flex items-center justify-center min-h-screen p-6">
      <div class="text-center max-w-xs">
        <Icon icon="mdi:map-marker-question-outline" class="h-16 w-16 text-white/20 mx-auto" />
        <h2 class="mt-5 text-xl font-bold text-white">Not Found</h2>
        <p class="mt-2 text-sm text-white/50 leading-relaxed">
          We couldn't find a venue at this address. Double-check the link and try again.
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-6">
      <div class="text-center max-w-xs">
        <Icon icon="mdi:alert-circle-outline" class="h-16 w-16 text-red-400/60 mx-auto" />
        <h2 class="mt-5 text-xl font-bold text-white">Something went wrong</h2>
        <p class="mt-2 text-sm text-white/50 leading-relaxed">
          Unable to load venue information. Please try again later.
        </p>
      </div>
    </div>

    <!-- Content -->
    <welcome-component
      v-if="organization"
      :name="organization.name"
      :description="organization.description"
      :banner-image="organization.bannerImage"
      :code="organization.code"
      @sign-in="signInWithGoogle"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { Icon } from '@iconify/vue';
import { useToast } from '@/plugins/toast';
import { getOrganizationByCode } from '@/api/organization';
import WelcomeComponent from '@/components/members/WelcomeComponent.vue';

const router = useRouter();
const store = useStore();
const toast = useToast();

const loading = ref(true);
const error = ref(false);
const notFound = ref(false);
const organization = ref(null);
const route = useRoute();
const organizationCode = route.params.code;

const fetchOrganizationInfo = async () => {
  if (!organizationCode) {
    notFound.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = false;
  notFound.value = false;
  
  try {
    console.log('🏢 Fetching organization info for code:', organizationCode);
    const response = await getOrganizationByCode(organizationCode);
    organization.value = response.data?.data;
    console.log('🏢 Organization loaded:', {
      hasOrg: !!organization.value,
      code: organization.value?.code,
      id: organization.value?._id,
      name: organization.value?.name,
      description: organization.value?.description,
      fullData: organization.value
    });
    
    // Preload the banner image
    if (organization.value?.bannerImage) {
      const img = new Image();
      img.src = organization.value.bannerImage;
    }
    
    loading.value = false;
  } catch (err) {
    console.error('Failed to fetch organization:', err);
    if (err.message === 'Organization not found') {
      notFound.value = true;
    } else {
      error.value = true;
      toast('Failed to load brewery information', 'error');
    }
    loading.value = false;
  }
};


const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        resolve(window.google);
      } else if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        // Script is loading, wait for it
        setTimeout(checkGoogleLoaded, 100);
      } else {
        // Script is not present, add it
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => checkGoogleLoaded();
        script.onerror = () => reject(new Error('Failed to load Google Sign In'));
        document.head.appendChild(script);
      }
    };
    checkGoogleLoaded();
  });
};

const signInWithGoogle = async () => {
  try {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      toast('Google Sign In is not properly configured', 'error');
      return;
    }

    const google = await initializeGoogleSignIn();
    
    // Initialize with FedCM enabled
    // For development, use localtest.me which resolves to 127.0.0.1
    const hostname = window.location.hostname;
    const isLocalDev = hostname.includes('localhost') || hostname.includes('.local');
    const origin = isLocalDev 
      ? `http://${window.location.hostname.split('.')[0]}.localtest.me:${window.location.port}`
      : window.location.origin;

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response.credential) {
          toast('Failed to sign in with Google', 'error');
          return;
        }

        try {
          const authResult = await store.dispatch('auth/handleGoogleLogin', {
            credential: response.credential,
            // Send public organization code (backend expects code, not _id)
            code: organization.value?.code
          });
          
          console.log('🔑 Google login completed:', {
            hasUser: !!authResult.user,
            hasMembership: !!authResult.membership,
            membershipDetails: authResult.membership,
            userDetails: {
              id: authResult.user?.id,
              email: authResult.user?.email,
              memberships: authResult.user?.memberships
            }
          });

          if (!authResult.membership) {
            toast('No membership found for this brewery', 'error');
            return;
          }

          toast('Successfully signed in!', 'success');
          router.push({ name: 'member-portal', params: { code: organization.value?.code } });
        } catch (error) {
          console.error('Google login error:', error);
          toast(error.message || 'Failed to authenticate with server', 'error');
        }
      },
      use_fedcm_for_prompt: true, // Enable FedCM
      origin: origin, // Set the origin explicitly
      ux_mode: 'popup',
      itp_support: true,
      context: 'signin',
      prompt_parent_id: 'googleSignInButton'
    });

    // Create a button element for rendering
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'googleSignInButton';
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '-1000px';
    document.body.appendChild(buttonContainer);

    // Render the button (this is required for FedCM)
    google.accounts.id.renderButton(buttonContainer, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 400
    });

    // Programmatically click the button to show the sign-in UI
    const googleButton = buttonContainer.querySelector('div[role="button"]');
    if (googleButton) {
      googleButton.click();
    } else {
      // Fallback to prompt if button rendering fails
      google.accounts.id.prompt();
    }

    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(buttonContainer);
    }, 1000);
  } catch (error) {
    console.error('Google sign in error:', error);
    toast('Failed to initialize Google Sign In', 'error');
  }
};


onMounted(() => {
  fetchOrganizationInfo();
});
</script>

<style scoped>
</style>
