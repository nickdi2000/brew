<template>
  <button
    type="button"
    class="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-blue-400/80 bg-white/95 px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:border-blue-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    :disabled="props.disabled || isLoading"
    :aria-busy="isLoading"
    @click="handleClick"
  >
    <span class="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/70 via-transparent to-blue-100/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
    <span class="relative flex items-center gap-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-inner ring-4 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
        <Icon icon="mdi:google" class="h-5 w-5" />
      </span>
      <span class="flex flex-col text-left leading-tight">
        <span class="text-base font-semibold">
          {{ isLoading ? 'Connecting to Google...' : 'Continue with Google' }}
        </span>
        <span class="text-xs font-medium text-gray-500">Secure Google sign-in</span>
      </span>
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import { googleLogin } from '@/api'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success'])

const isLoading = ref(false)
const toast = useToast()

onMounted(() => {
  if (!window.google?.accounts?.oauth2) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onerror = () => {
      toast('Failed to load Google authentication', 'error')
    }
    document.head.appendChild(script)
  }
})

const handleClick = async () => {
  if (isLoading.value || props.disabled) {
    return
  }

  try {
    isLoading.value = true

    const auth = window.google?.accounts?.oauth2
    if (!auth) {
      throw new Error('Google accounts SDK not loaded')
    }

    const codeClient = auth.initCodeClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      ux_mode: 'popup',
      callback: async (response) => {
        if (response.error) {
          toast('Google authentication failed', 'error')
          isLoading.value = false
          return
        }

        try {
          const apiResponse = await googleLogin(response.code)
          emit('success', apiResponse.data.data)
          toast('Signed in with Google', 'success')
          try {
            gtag_report_conversion;
          } catch (err) {
            console.error('Google tag conversion error:', err);
          }
        } catch (error) {
          console.error('Google login API error:', error)
          toast(error.response?.data?.message || error.message || 'Failed to sign in with Google', 'error')
        } finally {
          isLoading.value = false
        }
      }
    })

    codeClient.requestCode()
  } catch (error) {
    console.error('Google auth error:', error)
    toast(error.response?.data?.message || error.message || 'Failed to sign in with Google', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

