<template>
  <div class="space-y-6 animate-slide-up">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gradient-blue font-display">My Profile</h2>
      <span class="text-sm text-gray-500 font-accent">Last updated: {{ new Date().toLocaleDateString() }}</span>
    </div>

    <div class="glass-clean rounded-lg p-8">
      <div class="space-y-8">
        <!-- Profile Photo Section -->
        <div class="flex items-center animate-slide-right" style="animation-delay: 100ms">
          <div class="relative group">
            <div class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg transition-transform duration-300 transform group-hover:scale-105">
              <!-- Placeholder for profile image with gradient overlay -->
              <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <svg class="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button class="text-white text-sm font-medium">Change Photo</button>
            </div>
          </div>
          <div class="ml-8">
            <button class="btn btn-primary btn-shimmer font-accent">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New Photo
            </button>
            <p class="mt-2 text-sm text-gray-500 font-accent">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 animate-slide-up" style="animation-delay: 200ms">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 font-accent">First Name</label>
              <input
                type="text"
                v-model="form.firstName"
                class="input-glass w-full rounded-lg px-4 py-2.5 text-gray-900 font-accent transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 font-accent">Last Name</label>
              <input
                type="text"
                v-model="form.lastName"
                class="input-glass w-full rounded-lg px-4 py-2.5 text-gray-900 font-accent transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 font-accent">Email</label>
              <input
                type="email"
                v-model="form.email"
                class="input-glass w-full rounded-lg px-4 py-2.5 text-gray-900 font-accent transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 font-accent">Phone Number</label>
              <input
                type="tel"
                v-model="form.phone"
                class="input-glass w-full rounded-lg px-4 py-2.5 text-gray-900 font-accent transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 font-accent">Bio</label>
            <textarea
              v-model="form.bio"
              rows="4"
              class="input-glass w-full rounded-lg px-4 py-2.5 text-gray-900 font-accent transition-all duration-300 focus:ring-2 focus:ring-blue-500/30"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              class="btn btn-secondary hover-lift font-accent"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary btn-shimmer font-accent"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const form = ref({
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@brewbucks.com',
  phone: '(555) 123-4567',
  bio: 'Passionate about craft beer and building amazing customer experiences. Managing our rewards program since 2023.'
})

const handleSubmit = async () => {
  try {
    // TODO: Implement profile update logic
    console.log('Form submitted:', form.value)
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}
</script>
