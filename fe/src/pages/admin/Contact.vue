<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Contact BrewTokens</h1>
      <p class="text-gray-600 mt-1">Send us a note right from your admin portal.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input
          v-model="email"
          type="email"
          class="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
          disabled
        />
        <p class="text-xs text-gray-500 mt-1">Using your logged-in admin email.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Comments</label>
        <textarea
          v-model="comments"
          rows="6"
          placeholder="How can we help?"
          class="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
          :disabled="isSubmitting"
          required
        ></textarea>
      </div>

      <div class="flex items-center gap-3">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send message' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="isSubmitting">Clear</button>
      </div>

      <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
      <p v-if="submitSuccess" class="text-sm text-green-600">Thanks! We received your message.</p>
    </form>
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { submitContactRequest } from '@/api'
import { useToast } from '@/plugins/toast'

const store = useStore()
const toast = useToast()

// Hardcode email from current admin user
const email = computed(() => store.getters.currentUser?.email || '')
const comments = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

const handleSubmit = async () => {
  submitError.value = ''
  submitSuccess.value = false

  const message = comments.value.trim()
  if (!message) {
    submitError.value = 'Please enter your comments.'
    toast('Please enter your comments.', 'error')
    return
  }

  try {
    isSubmitting.value = true
    const resp = await submitContactRequest({ email: email.value, message })
    if (resp.data?.success) {
      submitSuccess.value = true
      toast(resp.data.message || 'Message sent!', 'success')
      comments.value = ''
    } else {
      submitError.value = resp.data?.message || 'Failed to send message.'
      toast(submitError.value, 'error')
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to send message.'
    submitError.value = msg
    toast(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  comments.value = ''
  submitError.value = ''
  submitSuccess.value = false
}
</script>

<style scoped>
</style>


