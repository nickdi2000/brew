<template>
  <div class="min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p class="mt-4 text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-sm">
        <Icon icon="mdi:brewery" class="h-20 w-20 text-amber-500 mx-auto" />
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Brewery Not Found</h2>
        <p class="mt-3 text-gray-600">
          We couldn't find a brewery at this address.
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg max-w-sm">
        <div class="flex items-center">
          <Icon icon="mdi:alert" class="h-5 w-5 text-red-400 flex-shrink-0" />
          <p class="ml-3 text-sm text-red-700">
            Unable to load brewery information.
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="organization" class="min-h-screen">
      <welcome-component
        :name="organization.name"
        :description="organization.description"
        :banner-image="organization.bannerImage"
        :code="organization.code"
        @sign-in="signInWithGoogle"
      />
    </div>
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
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Hover animations */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Loading animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
