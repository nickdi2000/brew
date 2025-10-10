<template>
  <button
    type="button"
    class="gsi-material-button"
    :disabled="props.disabled || isLoading"
    :aria-busy="isLoading"
    @click="handleClick"
  >
    <div class="gsi-material-button-state"></div>
    <div class="gsi-material-button-content-wrapper">
      <div class="gsi-material-button-icon">
        <Icon icon="logos:google-icon" class="h-5 w-5" />
      </div>
      <span class="gsi-material-button-contents" aria-live="polite">
        {{ isLoading ? 'Connecting to Google...' : 'Continue with Google' }}
      </span>
    </div>
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
            if (typeof window.gtag_report_conversion === 'function') {
              window.gtag_report_conversion()
            }
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

<style scoped>
.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border: 1px solid #747775;
  border-radius: 4px;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', Arial, sans-serif;
  font-size: 14px;
  height: 44px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  transition: background-color 0.218s, border-color 0.218s, box-shadow 0.218s, transform 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  width: 100%;
  max-width: 400px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  flex-grow: 1;
  font-family: 'Roboto', Arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gsi-material-button .gsi-material-button-state {
  transition: opacity 0.218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: not-allowed;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents,
.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 0.38;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state,
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 0.12;
}

.gsi-material-button:not(:disabled):hover {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
  transform: translateY(-1px);
}

.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
  background-color: #303030;
  opacity: 0.08;
}
</style>

