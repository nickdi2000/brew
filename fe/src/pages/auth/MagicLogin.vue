<template>
  <MagicLoginTransition v-if="state.status === 'transition'" />
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <div class="text-center space-y-3">
          <Icon icon="mdi:beer" class="mx-auto h-12 w-12 text-amber-500" />
          <h1 class="text-2xl font-semibold text-gray-900">Magic Login</h1>
          <p class="text-sm text-gray-600">
            We are verifying your magic login link. Hang tight!
          </p>
        </div>

        <div v-if="state.status === 'loading'" class="space-y-4">
          <div class="animate-pulse bg-amber-100 h-2 rounded-full"></div>
          <div class="flex items-center justify-center text-gray-500 text-sm">
            <Icon icon="mdi:clock-outline" class="w-5 h-5 mr-2" />
            Checking your token...
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-center text-red-600">
            <Icon icon="mdi:alert" class="w-6 h-6 mr-2" />
            {{ state.errorMessage || 'Magic link validation failed.' }}
          </div>
          <div class="space-y-2">
            <button
              type="button"
              class="btn btn-primary w-full"
              @click="returnToLogin"
            >
              Back to Login
            </button>
            <button
              type="button"
              class="btn btn-secondary w-full"
              @click="requestNewLink"
            >
              Request new magic link
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import { generateMagicLoginLink } from '@/api'
import { useStore } from 'vuex'
import MagicLoginTransition from '@/components/auth/MagicLoginTransition.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const store = useStore()

const state = reactive({
  status: 'loading',
  errorMessage: '',
  email: ''
})

const redirectToDashboard = async () => {
  try {
    await router.replace({ name: 'dashboard' })
  } catch (error) {
    console.error('Failed to redirect after magic login:', error)
  }
}

const handleValidationFailure = (message) => {
  state.status = 'error'
  state.errorMessage = message
  toast(message, 'error')
}

const validateToken = async () => {
  const token = route.params.token

  if (!token) {
    handleValidationFailure('Magic login token is missing from the URL.')
    return
  }

  try {
    const response = await store.dispatch('magicLogin', {
      token,
      redirect: route.query.redirect || '/admin',
      skipRedirect: true
    })

    if (!response?.success) {
      throw new Error(response?.message || 'Magic login link is invalid.')
    }

    const payload = response?.data || {}
    state.email = payload?.user?.email || ''

    state.status = 'transition'

    setTimeout(() => {
      state.status = 'success'
      setTimeout(() => {
        redirectToDashboard()
      }, 1200)
    }, 3000)
  } catch (error) {
    console.error('Magic login validation failed:', error)
    handleValidationFailure(error?.response?.data?.message || error?.message || 'Magic login validation failed.')
  }
}

const returnToLogin = () => {
  router.push({ name: 'admin-login', query: { email: state.email } })
}

const requestNewLink = async () => {
  if (!state.email) {
    toast('We could not determine your email. Please request a new link from the login page.', 'error')
    return
  }

  try {
    const response = await generateMagicLoginLink(state.email)

    if (!response?.success) {
      throw new Error(response?.message || 'Failed to send magic login link.')
    }

    toast('Magic login link sent! Check your inbox.', 'success')
  } catch (error) {
    console.error('Failed to issue new magic link:', error)
    toast(error?.response?.data?.message || error?.message || 'Failed to send magic login link.', 'error')
  }
}

onMounted(() => {
  if (store.getters.isAuthenticated && store.getters.currentUser) {
    toast('You are already signed in. Redirecting you now.', 'success')
    redirectToDashboard()
    return
  }

  validateToken()
})
</script>

