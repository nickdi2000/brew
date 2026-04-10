<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Site Builder</h1>
      <p class="text-sm text-gray-600">
        Create and customize your venue's website to showcase your loyalty program
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <Icon icon="mdi:alert-circle" class="h-5 w-5 text-red-600 mr-2" />
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
    </div>

    <!-- No Website - Create New -->
    <div v-else-if="!website" class="text-center py-12">
      <Icon icon="mdi:web" class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No website yet</h3>
      <p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        Create a custom website for your venue to showcase your loyalty program and engage with customers.
      </p>
      
      <div class="max-w-sm mx-auto">
        <label for="venueName" class="block text-sm font-medium text-gray-700 mb-2 text-left">
          Venue Name <span class="text-red-500">*</span>
        </label>
        <input
          id="venueName"
          v-model="newVenueName"
          type="text"
          required
          class="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
          placeholder="Enter your venue name"
          @keyup.enter="handleCreateWebsite"
        />
        <button
          class="btn btn-primary w-full"
          @click="handleCreateWebsite"
          :disabled="isSaving || !newVenueName.trim()"
        >
          <Icon icon="mdi:plus" class="h-5 w-5 mr-2" />
          <span v-if="isSaving">Creating...</span>
          <span v-else">Create Website</span>
        </button>
      </div>
    </div>

    <!-- Website Form -->
    <div v-else class="space-y-8 pb-24">
      <!-- Publish Status Banner with Preview -->
      <div :class="[
        'rounded-lg p-4',
        website.isPublished ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
      ]">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center">
            <Icon 
              :icon="website.isPublished ? 'mdi:check-circle' : 'mdi:circle-outline'" 
              :class="[
                'h-5 w-5 mr-2',
                website.isPublished ? 'text-green-600' : 'text-gray-400'
              ]"
            />
            <div>
              <p :class="[
                'text-sm font-medium',
                website.isPublished ? 'text-green-900' : 'text-gray-900'
              ]">
                {{ website.isPublished ? 'Website is Published' : 'Website is Not Published' }}
              </p>
              <p :class="[
                'text-xs',
                website.isPublished ? 'text-green-700' : 'text-gray-600'
              ]">
                {{ website.isPublished ? 'Your website is live and visible to customers' : 'Your website is in draft mode' }}
              </p>
            </div>
          </div>
          <div>
            <button
              :class="[
                'btn',
                website.isPublished ? 'btn-secondary' : 'btn-primary'
              ]"
              @click="handleTogglePublish"
              :disabled="isTogglingPublish"
            >
              <span v-if="isTogglingPublish">{{ website.isPublished ? 'Unpublishing...' : 'Publishing...' }}</span>
              <span v-else>{{ website.isPublished ? 'Unpublish' : 'Publish' }}</span>
            </button>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-8">
        <!-- Website Access -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:link-variant" class="h-5 w-5 mr-2 text-amber-600" />
            Website Access
          </h2>
          
          <div class="space-y-6">
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
                Website Code <span class="text-red-500">*</span>
              </label>
              <input
                id="code"
                v-model="form.code"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="e.g., crafty-pint"
                pattern="[a-z0-9-]+"
              />
              <p class="mt-1 text-xs text-gray-500">
                URL-friendly code for your website. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>

            <!-- Website URL Display -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-900 mb-2 flex items-center">
                    <Icon icon="mdi:earth" class="h-4 w-4 mr-2" />
                    Your Website URL
                  </p>
                  <a
                    :href="getWebsiteUrl()"
                    target="_blank"
                    class="text-sm text-amber-700 hover:text-amber-900 underline break-all"
                  >
                    {{ getWebsiteUrl() }}
                  </a>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary flex-shrink-0"
                  @click="handlePreview"
                >
                  <Icon icon="mdi:eye" class="h-5 w-5 mr-2" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:information" class="h-5 w-5 mr-2 text-amber-600" />
            Basic Information
          </h2>
          
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label for="venueName" class="block text-sm font-medium text-gray-700 mb-1">
                Venue Name <span class="text-red-500">*</span>
              </label>
              <input
                id="venueName"
                v-model="form.venueName"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
              placeholder="e.g., The Crafty Pint"
            />
          </div>

          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="e.g., Welcome to The Crafty Pint"
              />
            </div>

            <div>
              <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                id="subtitle"
                v-model="form.subtitle"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="e.g., Your favorite local spot for great food and drinks"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="Tell customers about your venue and loyalty program..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Hero Image Section -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:image-area" class="h-5 w-5 mr-2 text-amber-600" />
            Hero Image
          </h2>
          
          <div class="space-y-4">
            <!-- Hero Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Image Source
              </label>
              <div class="flex gap-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.hero.type"
                    type="radio"
                    value="preset"
                    class="mr-2 text-amber-600 focus:ring-amber-500"
                  />
                  <span class="text-sm text-gray-700">Pre-made Images</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="form.hero.type"
                    type="radio"
                    value="custom"
                    class="mr-2 text-amber-600 focus:ring-amber-500"
                  />
                  <span class="text-sm text-gray-700">Custom Upload</span>
                </label>
              </div>
            </div>

            <!-- Preset Images Grid -->
            <div v-if="form.hero.type === 'preset'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="heroImage in presetHeroImages"
                :key="heroImage.value"
                @click="form.hero.value = heroImage.value"
                :class="[
                  'relative rounded-lg overflow-hidden cursor-pointer border-4 transition-all',
                  form.hero.value === heroImage.value
                    ? 'border-amber-500 shadow-lg'
                    : 'border-gray-200 hover:border-amber-300'
                ]"
              >
                <img
                  :src="heroImage.src"
                  :alt="heroImage.name"
                  class="w-full h-32 object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p class="text-white text-xs font-medium text-center">{{ heroImage.name }}</p>
                </div>
                <div
                  v-if="form.hero.value === heroImage.value"
                  class="absolute top-2 right-2 bg-amber-500 rounded-full p-1"
                >
                  <Icon icon="mdi:check" class="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <!-- Custom Upload -->
            <div v-if="form.hero.type === 'custom'" class="space-y-3">
              <div>
                <label for="customHeroUrl" class="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="customHeroUrl"
                  v-model="form.hero.value"
                  type="url"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                  placeholder="https://example.com/your-hero-image.jpg"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Enter the URL of your custom hero image. For best results, use an image at least 1920x600px.
                </p>
              </div>
              
              <!-- Preview -->
              <div v-if="form.hero.value" class="mt-3">
                <p class="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div class="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    :src="form.hero.value"
                    alt="Custom hero preview"
                    class="w-full h-48 object-cover"
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>

            <!-- Current Selection Info -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p class="text-sm text-amber-900">
                <Icon icon="mdi:information" class="inline h-4 w-4 mr-1" />
                <strong>Current selection:</strong> 
                {{ form.hero.type === 'preset' ? getPresetImageName(form.hero.value) : 'Custom image' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:phone" class="h-5 w-5 mr-2 text-amber-600" />
            Contact Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="contactEmail"
                v-model="form.contactEmail"
                type="email"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="contact@venue.com"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="(555) 123-4567"
              />
            </div>

            <div class="md:col-span-2">
              <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                id="street"
                v-model="form.address.street"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="city"
                v-model="form.address.city"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="Anytown"
              />
            </div>

            <div>
              <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                id="state"
                v-model="form.address.state"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="CA"
              />
            </div>

            <div>
              <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                id="zip"
                v-model="form.address.zip"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="12345"
              />
            </div>

            <div>
              <label for="hours" class="block text-sm font-medium text-gray-700 mb-1">
                Hours
              </label>
              <textarea
                id="hours"
                v-model="form.hours"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="Mon-Fri: 11am-10pm&#10;Sat-Sun: 10am-11pm"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon icon="mdi:share-variant" class="h-5 w-5 mr-2 text-amber-600" />
            Social Links
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="facebook" class="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                id="facebook"
                v-model="form.socialLinks.facebook"
                type="url"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                id="instagram"
                v-model="form.socialLinks.instagram"
                type="url"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div>
              <label for="twitter" class="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                id="twitter"
                v-model="form.socialLinks.twitter"
                type="url"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="https://twitter.com/yourpage"
              />
            </div>

            <div>
              <label for="website" class="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                v-model="form.socialLinks.website"
                type="url"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-400 focus:ring-2 focus:ring-amber-300"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

      </form>

      <!-- Fixed Floating Action Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleReset"
              :disabled="isSaving"
            >
              <Icon icon="mdi:refresh" class="h-5 w-5 mr-2" />
              Reset
            </button>
            <button
              type="button"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              @click="handleSave"
              :disabled="isSaving || !form.venueName.trim()"
            >
              <Icon icon="mdi:content-save" class="h-5 w-5 mr-2" />
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useToast } from '@/plugins/toast'
import { useStore } from 'vuex'
import api from '@/api'

const toast = useToast()
const store = useStore()

// Preset hero images
const presetHeroImages = [
  { value: 'hero-standard.png', name: 'Standard', src: new URL('@/assets/images/heros/hero-standard.png', import.meta.url).href },
  { value: 'hero-brewery.png', name: 'Brewery', src: new URL('@/assets/images/heros/hero-brewery.png', import.meta.url).href },
  { value: 'hero-coffee.png', name: 'Coffee Shop', src: new URL('@/assets/images/heros/hero-coffee.png', import.meta.url).href },
  { value: 'hero-fancy.png', name: 'Fine Dining', src: new URL('@/assets/images/heros/hero-fancy.png', import.meta.url).href },
  { value: 'hero-italian.png', name: 'Italian', src: new URL('@/assets/images/heros/hero-italian.png', import.meta.url).href },
  { value: 'hero-patio.png', name: 'Patio', src: new URL('@/assets/images/heros/hero-patio.png', import.meta.url).href },
  { value: 'hero-roadhouse.png', name: 'Roadhouse', src: new URL('@/assets/images/heros/hero-roadhouse.png', import.meta.url).href }
]

const website = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isTogglingPublish = ref(false)
const error = ref('')
const newVenueName = ref('')

const form = ref({
  venueName: '',
  code: '',
  title: '',
  subtitle: '',
  description: '',
  contactEmail: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  hours: '',
  hero: {
    type: 'preset',
    value: 'hero-standard.png'
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    website: ''
  }
})

const fetchWebsite = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/website')
    console.log('Fetched website:', JSON.stringify(response.data.data, null, 2))
    
    if (response.data.data) {
      website.value = response.data.data
      populateForm()
    } else {
      website.value = null
    }
  } catch (err) {
    console.error('Failed to fetch website:', err)
    error.value = err.response?.data?.message || 'Failed to load website'
    toast(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

const populateForm = () => {
  if (!website.value) return
  
  form.value = {
    venueName: website.value.venueName || '',
    code: website.value.code || '',
    title: website.value.title || '',
    subtitle: website.value.subtitle || '',
    description: website.value.description || '',
    contactEmail: website.value.contactEmail || '',
    phone: website.value.phone || '',
    address: {
      street: website.value.address?.street || '',
      city: website.value.address?.city || '',
      state: website.value.address?.state || '',
      zip: website.value.address?.zip || ''
    },
    hours: website.value.hours || '',
    hero: {
      type: website.value.hero?.type || 'preset',
      value: website.value.hero?.value || 'hero-standard.png'
    },
    socialLinks: {
      facebook: website.value.socialLinks?.facebook || '',
      instagram: website.value.socialLinks?.instagram || '',
      twitter: website.value.socialLinks?.twitter || '',
      website: website.value.socialLinks?.website || ''
    }
  }
}

const handleCreateWebsite = async () => {
  if (!newVenueName.value.trim()) {
    toast('Please enter a venue name', 'error')
    return
  }

  isSaving.value = true
  
  try {
    const response = await api.post('/website', {
      venueName: newVenueName.value.trim()
    })
    console.log('Website created:', JSON.stringify(response.data.data, null, 2))
    
    website.value = response.data.data
    populateForm()
    newVenueName.value = ''
    
    toast('Website created successfully!', 'success')
  } catch (err) {
    console.error('Failed to create website:', err)
    const errorMessage = err.response?.data?.message || 'Failed to create website'
    toast(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

const handleSave = async () => {
  if (!form.value.venueName.trim()) {
    toast('Venue name is required', 'error')
    return
  }

  isSaving.value = true
  
  try {
    const response = await api.put('/website', form.value)
    console.log('Website updated:', JSON.stringify(response.data.data, null, 2))
    
    website.value = response.data.data
    
    toast('Website saved successfully!', 'success')
  } catch (err) {
    console.error('Failed to save website:', err)
    const errorMessage = err.response?.data?.message || 'Failed to save website'
    toast(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

const handleReset = () => {
  populateForm()
  toast('Form reset to saved values', 'success')
}

const handleTogglePublish = async () => {
  isTogglingPublish.value = true
  
  try {
    const newStatus = !website.value.isPublished
    const response = await api.patch('/website/publish', {
      isPublished: newStatus
    })
    console.log('Publish status toggled:', JSON.stringify(response.data.data, null, 2))
    
    website.value = response.data.data
    
    toast(
      newStatus ? 'Website published successfully!' : 'Website unpublished',
      'success'
    )
  } catch (err) {
    console.error('Failed to toggle publish status:', err)
    const errorMessage = err.response?.data?.message || 'Failed to update publish status'
    toast(errorMessage, 'error')
  } finally {
    isTogglingPublish.value = false
  }
}

const getWebsiteUrl = () => {
  const code = form.value.code || website.value?.code || 'your-code'
  const origin = window.location.origin
  return `${origin}/website/${code}`
}

const handlePreview = () => {
  if (!website.value?.code) {
    toast('Website code not available', 'error')
    return
  }
  
  // Open website in new tab using website's own code
  const url = `/website/${website.value.code}`
  window.open(url, '_blank')
}

const getPresetImageName = (value) => {
  const preset = presetHeroImages.find(img => img.value === value)
  return preset ? preset.name : value
}

const handleImageError = (event) => {
  console.error('Failed to load custom hero image:', event.target.src)
  toast('Failed to load custom hero image. Please check the URL.', 'error')
}

onMounted(() => {
  fetchWebsite()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>

