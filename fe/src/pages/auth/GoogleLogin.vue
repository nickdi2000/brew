<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in to {{ organizationName }}</h2>
        <p class="text-gray-600">Please wait while we connect to Google...</p>
      </div>
      
      <div id="googleSignInButton" class="flex justify-center"></div>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          By continuing, you agree to our
          <router-link to="/terms-of-service" class="text-amber-600 hover:text-amber-500">Terms of Service</router-link>
          and
          <router-link to="/privacy-policy" class="text-amber-600 hover:text-amber-500">Privacy Policy</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from '../../plugins/toast';

const route = useRoute();
const store = useStore();
const toast = useToast();

const organizationName = ref(route.query.orgName || 'BrewTokens');
const returnUrl = route.query.returnUrl;

const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        resolve(window.google);
      } else if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        setTimeout(checkGoogleLoaded, 100);
      } else {
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

const handleGoogleSignIn = async () => {
  try {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('Google Client ID not configured');
      toast('Google Sign In is not properly configured', 'error');
      return;
    }

    const google = await initializeGoogleSignIn();
    
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response.credential) {
          toast('Failed to sign in with Google', 'error');
          return;
        }

        try {
          await store.dispatch('auth/handleGoogleLogin', {
            credential: response.credential
          });
          toast('Successfully signed in!', 'success');
          
          // Redirect back to the original URL
          if (returnUrl) {
            window.location.href = returnUrl;
          }
        } catch (error) {
          console.error('Google login error:', error);
          toast(error.message || 'Failed to authenticate with server', 'error');
        }
      },
      use_fedcm_for_prompt: true,
      ux_mode: 'popup'
    });

    // Render the sign-in button
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      }
    );

    // Automatically prompt for sign in
    google.accounts.id.prompt();
  } catch (error) {
    console.error('Google sign in error:', error);
    toast('Failed to initialize Google Sign In', 'error');
  }
};

onMounted(() => {
  handleGoogleSignIn();
});
</script>