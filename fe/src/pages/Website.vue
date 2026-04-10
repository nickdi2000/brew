<template>
  <div class="standalone-website">
    <!-- Loading State -->
    <div v-if="isLoading" class="sw-loading">
      <div class="sw-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="sw-error">
      <div class="sw-error-box">
        <Icon icon="mdi:alert-circle" class="sw-error-icon" />
        <h2 class="sw-error-title">Website Not Found</h2>
        <p class="sw-error-text">{{ error }}</p>
      </div>
    </div>

    <!-- Website Content -->
    <div v-else-if="website" class="sw-content">
      <!-- Hero Section -->
      <section class="sw-hero" :style="getHeroStyle()">
        <div class="sw-hero-gradient"></div>
        <div class="sw-hero-vignette"></div>
        <div class="sw-hero-inner">
          <div class="sw-hero-badge">Welcome to</div>
          <h1 class="sw-hero-title">{{ website.title || website.venueName }}</h1>
          <p v-if="website.subtitle" class="sw-hero-subtitle">{{ website.subtitle }}</p>
          <div class="sw-hero-buttons">
            <a
              v-if="organization"
              :href="`/members/${organization.code}`"
              class="sw-btn sw-btn-primary"
            >
              <Icon icon="mdi:gift" class="sw-btn-icon" />
              Join Our Rewards
            </a>
            <a
              v-if="website.contactEmail"
              :href="`mailto:${website.contactEmail}`"
              class="sw-btn sw-btn-ghost"
            >
              <Icon icon="mdi:email" class="sw-btn-icon" />
              Get in Touch
            </a>
          </div>
        </div>
        <div class="sw-hero-scroll">
          <Icon icon="mdi:chevron-down" class="sw-scroll-icon" />
        </div>
      </section>

      <!-- Active Announcements -->
      <section v-if="activeAnnouncements.length > 0" class="sw-announcements">
        <div class="sw-container">
          <div class="sw-announcements-inner">
            <Icon icon="mdi:bullhorn" class="sw-announce-icon" />
            <div class="sw-announce-content">
              <div v-for="announcement in activeAnnouncements" :key="announcement._id" class="sw-announcement">
                <strong>{{ announcement.title }}</strong> — {{ announcement.message }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section (Dark) -->
      <section v-if="website.description" class="sw-section sw-section-dark">
        <div class="sw-container-narrow">
          <div class="sw-section-header">
            <div class="sw-section-badge">Our Story</div>
            <h2 class="sw-section-title">About {{ website.venueName }}</h2>
            <div class="sw-divider"></div>
          </div>
          <p class="sw-about-text">{{ website.description }}</p>
        </div>
      </section>

      <!-- Features Section (Light) -->
      <section v-if="website.features && website.features.length > 0" class="sw-section sw-section-light">
        <div class="sw-container">
          <div class="sw-section-header">
            <div class="sw-section-badge">What Makes Us Special</div>
            <h2 class="sw-section-title">Experience Excellence</h2>
            <div class="sw-divider sw-divider-dark"></div>
          </div>
          <div class="sw-features">
            <div
              v-for="(feature, index) in website.features"
              :key="index"
              class="sw-feature"
            >
              <div 
                class="sw-feature-icon-box"
                :style="{ 
                  background: `linear-gradient(135deg, ${website.theme?.primaryColor || '#D4AF37'}22, ${website.theme?.primaryColor || '#D4AF37'}11)`
                }"
              >
                <Icon 
                  :icon="feature.icon || 'mdi:star'" 
                  class="sw-feature-icon"
                  :style="{ color: website.theme?.primaryColor || '#D4AF37' }"
                />
              </div>
              <h3 class="sw-feature-title">{{ feature.title }}</h3>
              <p class="sw-feature-text">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Information Section (Dark) -->
      <section class="sw-section sw-section-dark sw-section-gradient">
        <div class="sw-container">
          <div class="sw-section-header">
            <div class="sw-section-badge">Find Us</div>
            <h2 class="sw-section-title">Visit Our Location</h2>
            <div class="sw-divider"></div>
          </div>
          <div class="sw-contact-grid">
            <!-- Address -->
            <div v-if="hasAddress" class="sw-contact-card">
              <div class="sw-contact-icon-wrapper">
                <Icon icon="mdi:map-marker" class="sw-contact-icon" />
              </div>
              <h3 class="sw-contact-title">Address</h3>
              <p class="sw-contact-info">
                <span v-if="website.address.street">{{ website.address.street }}<br /></span>
                <span v-if="website.address.city || website.address.state || website.address.zip">
                  {{ website.address.city }}<span v-if="website.address.city && website.address.state">, </span>{{ website.address.state }} {{ website.address.zip }}
                </span>
              </p>
            </div>

            <!-- Phone -->
            <div v-if="website.phone" class="sw-contact-card">
              <div class="sw-contact-icon-wrapper">
                <Icon icon="mdi:phone" class="sw-contact-icon" />
              </div>
              <h3 class="sw-contact-title">Phone</h3>
              <a :href="`tel:${website.phone}`" class="sw-contact-link">
                {{ website.phone }}
              </a>
            </div>

            <!-- Email -->
            <div v-if="website.contactEmail" class="sw-contact-card">
              <div class="sw-contact-icon-wrapper">
                <Icon icon="mdi:email" class="sw-contact-icon" />
              </div>
              <h3 class="sw-contact-title">Email</h3>
              <a :href="`mailto:${website.contactEmail}`" class="sw-contact-link">
                {{ website.contactEmail }}
              </a>
            </div>

            <!-- Hours -->
            <div v-if="website.hours" class="sw-contact-card">
              <div class="sw-contact-icon-wrapper">
                <Icon icon="mdi:clock-outline" class="sw-contact-icon" />
              </div>
              <h3 class="sw-contact-title">Hours</h3>
              <p class="sw-contact-info">{{ website.hours }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Form Section (Dark) -->
      <section class="sw-section sw-section-dark sw-form-section">
        <div class="sw-container-narrow">
          <div class="sw-section-header">
            <div class="sw-section-badge">Get In Touch</div>
            <h2 class="sw-section-title">Send Us a Message</h2>
            <div class="sw-divider"></div>
          </div>

          <!-- Form Container -->
          <div class="sw-form-wrapper">
            <!-- Contact Form -->
            <form v-if="!formSubmitted" @submit.prevent="handleSubmit" class="sw-form">
              <div class="sw-form-group">
                <label for="fullName" class="sw-form-label">Full Name</label>
                <input
                  id="fullName"
                  v-model="contactForm.fullName"
                  type="text"
                  required
                  class="sw-form-input"
                  placeholder="John Doe"
                />
              </div>

              <div class="sw-form-group">
                <label for="email" class="sw-form-label">Email Address</label>
                <input
                  id="email"
                  v-model="contactForm.email"
                  type="email"
                  required
                  class="sw-form-input"
                  placeholder="john@example.com"
                />
              </div>

              <div class="sw-form-group">
                <label for="comments" class="sw-form-label">Message</label>
                <textarea
                  id="comments"
                  v-model="contactForm.comments"
                  required
                  rows="5"
                  class="sw-form-textarea"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
              </div>

              <button
                type="submit"
                class="sw-form-submit"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting" class="sw-submit-text">
                  <Icon icon="mdi:send" class="sw-submit-icon" />
                  Send Message
                </span>
                <span v-else class="sw-submit-loading">
                  <Icon icon="mdi:loading" class="sw-loading-icon" />
                  Sending...
                </span>
              </button>
            </form>

            <!-- Success State -->
            <div v-else class="sw-form-success">
              <div class="sw-success-icon-wrapper">
                <Icon icon="mdi:check-circle" class="sw-success-icon" />
              </div>
              <h3 class="sw-success-title">Message Sent!</h3>
              <p class="sw-success-text">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button @click="resetForm" class="sw-btn sw-btn-ghost sw-success-btn">
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Social Links Section (Light) -->
      <section v-if="hasSocialLinks" class="sw-section sw-section-light sw-social-section">
        <div class="sw-container-narrow">
          <div class="sw-section-header">
            <div class="sw-section-badge">Stay Connected</div>
            <h2 class="sw-section-title">Follow Our Journey</h2>
            <div class="sw-divider sw-divider-dark"></div>
          </div>
          <div class="sw-socials">
            <a
              v-if="website.socialLinks.facebook"
              :href="website.socialLinks.facebook"
              target="_blank"
              rel="noopener noreferrer"
              class="sw-social sw-social-facebook"
              aria-label="Facebook"
            >
              <Icon icon="mdi:facebook" class="sw-social-icon" />
            </a>
            <a
              v-if="website.socialLinks.instagram"
              :href="website.socialLinks.instagram"
              target="_blank"
              rel="noopener noreferrer"
              class="sw-social sw-social-instagram"
              aria-label="Instagram"
            >
              <Icon icon="mdi:instagram" class="sw-social-icon" />
            </a>
            <a
              v-if="website.socialLinks.twitter"
              :href="website.socialLinks.twitter"
              target="_blank"
              rel="noopener noreferrer"
              class="sw-social sw-social-twitter"
              aria-label="Twitter"
            >
              <Icon icon="mdi:twitter" class="sw-social-icon" />
            </a>
            <a
              v-if="website.socialLinks.website"
              :href="website.socialLinks.website"
              target="_blank"
              rel="noopener noreferrer"
              class="sw-social sw-social-web"
              aria-label="Website"
            >
              <Icon icon="mdi:web" class="sw-social-icon" />
            </a>
          </div>
        </div>
      </section>

      <!-- Footer (Ultra Dark) -->
      <footer 
        class="sw-footer"
        :style="{ backgroundColor: website.theme?.secondaryColor || '#0a0a0a' }"
      >
        <div class="sw-container">
          <div class="sw-footer-content">
            <div class="sw-footer-brand">
              <h3 class="sw-footer-name">{{ website.venueName }}</h3>
              <p class="sw-footer-tagline">{{ website.subtitle || 'Excellence in Every Detail' }}</p>
            </div>
            <div class="sw-footer-info">
              <p class="sw-footer-copy">
                © {{ new Date().getFullYear() }} {{ website.venueName }}. All rights reserved.
              </p>
              <p class="sw-footer-power">
                Powered by <span class="sw-footer-link">BrewTokens</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import api from '@/api'

// Import hero images
import heroStandard from '@/assets/images/heros/hero-standard.png'
import heroBrewery from '@/assets/images/heros/hero-brewery.png'
import heroCoffee from '@/assets/images/heros/hero-coffee.png'
import heroFancy from '@/assets/images/heros/hero-fancy.png'
import heroItalian from '@/assets/images/heros/hero-italian.png'
import heroPatio from '@/assets/images/heros/hero-patio.png'
import heroRoadhouse from '@/assets/images/heros/hero-roadhouse.png'

const heroImageMap = {
  'hero-standard.png': heroStandard,
  'hero-brewery.png': heroBrewery,
  'hero-coffee.png': heroCoffee,
  'hero-fancy.png': heroFancy,
  'hero-italian.png': heroItalian,
  'hero-patio.png': heroPatio,
  'hero-roadhouse.png': heroRoadhouse
}

const route = useRoute()

const website = ref(null)
const organization = ref(null)
const isLoading = ref(false)
const error = ref('')

// Contact form state
const contactForm = ref({
  fullName: '',
  email: '',
  comments: ''
})
const isSubmitting = ref(false)
const formSubmitted = ref(false)

const activeAnnouncements = computed(() => {
  if (!website.value?.announcements) return []
  return website.value.announcements.filter(a => a.active)
})

const hasAddress = computed(() => {
  if (!website.value?.address) return false
  const addr = website.value.address
  return addr.street || addr.city || addr.state || addr.zip
})

const hasSocialLinks = computed(() => {
  if (!website.value?.socialLinks) return false
  const links = website.value.socialLinks
  return links.facebook || links.instagram || links.twitter || links.website
})

const getHeroStyle = () => {
  const defaultHero = heroStandard
  
  if (!website.value?.hero || !website.value.hero.value) {
    return {
      backgroundImage: `url(${defaultHero})`
    }
  }
  
  if (website.value.hero.type === 'preset') {
    const heroImage = heroImageMap[website.value.hero.value] || defaultHero
    return {
      backgroundImage: `url(${heroImage})`
    }
  }
  
  if (website.value.hero.type === 'custom') {
    return {
      backgroundImage: `url(${website.value.hero.value}), url(${defaultHero})`
    }
  }
  
  return {
    backgroundImage: `url(${defaultHero})`
  }
}

const fetchWebsite = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const code = route.params.code
    
    if (!code) {
      throw new Error('Website code is required')
    }

    const websiteResponse = await api.get(`/website/public/${code}`)
    console.log('Fetched public website:', JSON.stringify(websiteResponse.data.data, null, 2))
    
    if (!websiteResponse.data.data) {
      throw new Error('Website not found or not published')
    }

    website.value = websiteResponse.data.data
    
    if (website.value.organization) {
      organization.value = website.value.organization
    }
  } catch (err) {
    console.error('Failed to fetch website:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load website'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call - replace with actual endpoint if needed
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Contact form submitted:', {
      fullName: contactForm.value.fullName,
      email: contactForm.value.email,
      comments: contactForm.value.comments,
      website: website.value.venueName
    })
    
    // Show success state
    formSubmitted.value = true
  } catch (err) {
    console.error('Failed to submit form:', err)
    alert('Failed to send message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  contactForm.value = {
    fullName: '',
    email: '',
    comments: ''
  }
  formSubmitted.value = false
}

onMounted(() => {
  fetchWebsite()
})
</script>

<style scoped>
/* ==================== LUXURY RESTAURANT WEBSITE ==================== */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');

.standalone-website {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1a1a1a;
  background: #0a0a0a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==================== LOADING ==================== */
.sw-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0a0a0a;
}

.sw-spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: sw-spin 0.8s ease-in-out infinite;
}

@keyframes sw-spin {
  to { transform: rotate(360deg); }
}

/* ==================== ERROR ==================== */
.sw-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: #0a0a0a;
}

.sw-error-box {
  max-width: 400px;
  text-align: center;
}

.sw-error-icon {
  display: block;
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  color: #D4AF37;
}

.sw-error-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.sw-error-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* ==================== CONTENT ==================== */
.sw-content {
  display: block;
}

/* ==================== HERO SECTION ==================== */
.sw-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 100px 24px 80px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  text-align: center;
}

.sw-hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
}

.sw-hero-vignette {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 2;
}

.sw-hero-inner {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  animation: sw-fadeIn 1.2s ease-out;
}

@keyframes sw-fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sw-hero-badge {
  display: inline-block;
  padding: 8px 24px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 30px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.3);
}

.sw-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 56px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 24px;
  line-height: 1.1;
  letter-spacing: -2px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.sw-hero-subtitle {
  font-size: 20px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 48px;
  line-height: 1.6;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.sw-hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.sw-hero-scroll {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  animation: sw-bounce 2s ease-in-out infinite;
}

@keyframes sw-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

.sw-scroll-icon {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.6);
}

@media (min-width: 768px) {
  .sw-hero-title {
    font-size: 80px;
  }
  
  .sw-hero-subtitle {
    font-size: 24px;
  }
}

/* ==================== BUTTONS ==================== */
.sw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 40px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.sw-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left 0.4s ease;
}

.sw-btn:hover::before {
  left: 100%;
}

.sw-btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  display: inline-block;
}

.sw-btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  color: #0a0a0a;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
}

.sw-btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.4);
}

.sw-btn-ghost {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.sw-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-4px);
}

/* ==================== ANNOUNCEMENTS ==================== */
.sw-announcements {
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  padding: 20px 24px;
  box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sw-announcements-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.sw-announce-icon {
  width: 24px;
  height: 24px;
  color: #0a0a0a;
  flex-shrink: 0;
}

.sw-announce-content {
  flex: 1;
  max-width: 900px;
}

.sw-announcement {
  font-size: 15px;
  font-weight: 400;
  color: #0a0a0a;
  text-align: center;
}

.sw-announcement strong {
  font-weight: 700;
}

/* ==================== CONTAINERS ==================== */
.sw-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.sw-container-narrow {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ==================== SECTIONS ==================== */
.sw-section {
  padding: 120px 0;
  position: relative;
}

.sw-section-dark {
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
}

.sw-section-light {
  background: linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%);
  color: #1a1a1a;
}

.sw-section-gradient {
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
}

.sw-section-header {
  text-align: center;
  margin-bottom: 80px;
}

.sw-section-badge {
  display: inline-block;
  padding: 8px 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 30px;
  margin-bottom: 20px;
  background: rgba(212, 175, 55, 0.05);
}

.sw-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 24px;
  letter-spacing: -1px;
  line-height: 1.2;
}

.sw-section-dark .sw-section-title {
  color: #ffffff;
}

.sw-section-light .sw-section-title {
  color: #1a1a1a;
}

.sw-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  margin: 0 auto;
}

.sw-divider-dark {
  background: linear-gradient(90deg, transparent, #1a1a1a, transparent);
}

/* ==================== ABOUT ==================== */
.sw-about-text {
  font-size: 20px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  white-space: pre-line;
  text-align: center;
  margin: 0;
  letter-spacing: 0.3px;
}

/* ==================== FEATURES ==================== */
.sw-features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

@media (min-width: 768px) {
  .sw-features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .sw-features {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sw-feature {
  background: #ffffff;
  padding: 40px 32px;
  border-radius: 2px;
  text-align: center;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-top: 3px solid transparent;
}

.sw-feature:hover {
  transform: translateY(-12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  border-top-color: #D4AF37;
}

.sw-feature-icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 0 0 24px;
  transition: all 0.4s ease;
}

.sw-feature:hover .sw-feature-icon-box {
  transform: scale(1.1) rotate(5deg);
}

.sw-feature-icon {
  width: 44px;
  height: 44px;
  display: inline-block;
}

.sw-feature-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.sw-feature-text {
  font-size: 16px;
  font-weight: 300;
  color: #666666;
  line-height: 1.7;
  margin: 0;
}

/* ==================== CONTACT ==================== */
.sw-contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media (min-width: 768px) {
  .sw-contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .sw-contact-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.sw-contact-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 36px 28px;
  border-radius: 2px;
  text-align: center;
  transition: all 0.4s ease;
  border: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(10px);
}

.sw-contact-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-8px);
}

.sw-contact-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.15);
  margin: 0 0 20px;
  transition: all 0.4s ease;
}

.sw-contact-card:hover .sw-contact-icon-wrapper {
  background: rgba(212, 175, 55, 0.25);
  transform: scale(1.1);
}

.sw-contact-icon {
  width: 28px;
  height: 28px;
  color: #D4AF37;
  display: inline-block;
}

.sw-contact-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: 0.5px;
}

.sw-contact-info {
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  white-space: pre-line;
  line-height: 1.6;
}

.sw-contact-link {
  display: inline-block;
  font-size: 15px;
  font-weight: 400;
  color: #D4AF37;
  text-decoration: none;
  word-break: break-all;
  transition: all 0.3s ease;
}

.sw-contact-link:hover {
  color: #ffffff;
  letter-spacing: 1px;
}

/* ==================== SOCIAL ==================== */
.sw-social-section {
  padding: 100px 0;
}

.sw-socials {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.sw-social {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.sw-social::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.sw-social:hover::before {
  width: 100%;
  height: 100%;
}

.sw-social:hover {
  transform: translateY(-8px) scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.sw-social-icon {
  width: 30px;
  height: 30px;
  color: #ffffff;
  display: inline-block;
  position: relative;
  z-index: 2;
}

.sw-social-facebook {
  background: linear-gradient(135deg, #1877F2 0%, #0C63D4 100%);
  box-shadow: 0 6px 20px rgba(24, 119, 242, 0.3);
}

.sw-social-instagram {
  background: linear-gradient(135deg, #E4405F 0%, #C13584 50%, #5851DB 100%);
  box-shadow: 0 6px 20px rgba(228, 64, 95, 0.3);
}

.sw-social-twitter {
  background: linear-gradient(135deg, #1DA1F2 0%, #0C85D0 100%);
  box-shadow: 0 6px 20px rgba(29, 161, 242, 0.3);
}

.sw-social-web {
  background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
  box-shadow: 0 6px 20px rgba(45, 55, 72, 0.3);
}

/* ==================== FOOTER ==================== */
.sw-footer {
  padding: 60px 24px 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.sw-footer-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}

.sw-footer-brand {
  text-align: center;
}

.sw-footer-name {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #D4AF37;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.sw-footer-tagline {
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.sw-footer-info {
  text-align: center;
}

.sw-footer-copy {
  font-size: 14px;
  margin: 0 0 8px;
  opacity: 0.7;
  font-weight: 300;
}

.sw-footer-power {
  font-size: 12px;
  margin: 0;
  opacity: 0.5;
  font-weight: 300;
}

.sw-footer-link {
  color: #D4AF37;
  font-weight: 400;
}

/* ==================== CONTACT FORM ==================== */
.sw-form-section {
  padding: 100px 0;
}

.sw-form-wrapper {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  min-height: 500px;
}

.sw-form {
  background: rgba(255, 255, 255, 0.03);
  padding: 48px 40px;
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(20px);
  animation: sw-formSlideIn 0.6s ease-out;
}

@keyframes sw-formSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sw-form-group {
  margin-bottom: 28px;
}

.sw-form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #D4AF37;
  margin-bottom: 10px;
}

.sw-form-input,
.sw-form-textarea {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  font-family: 'Lato', sans-serif;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  transition: all 0.3s ease;
  outline: none;
}

.sw-form-input::placeholder,
.sw-form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.sw-form-input:focus,
.sw-form-textarea:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.sw-form-textarea {
  resize: vertical;
  min-height: 120px;
}

.sw-form-submit {
  width: 100%;
  padding: 16px 32px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #0a0a0a;
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
  position: relative;
  overflow: hidden;
}

.sw-form-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.5s ease;
}

.sw-form-submit:hover::before {
  left: 100%;
}

.sw-form-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.4);
}

.sw-form-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sw-submit-text,
.sw-submit-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.sw-submit-icon,
.sw-loading-icon {
  width: 20px;
  height: 20px;
  display: inline-block;
}

.sw-loading-icon {
  animation: sw-rotate 1s linear infinite;
}

@keyframes sw-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==================== SUCCESS STATE ==================== */
.sw-form-success {
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(20px);
  animation: sw-successFadeIn 0.8s ease-out;
}

@keyframes sw-successFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.sw-success-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.15);
  margin: 0 0 28px;
  animation: sw-iconPulse 1.5s ease-out;
}

@keyframes sw-iconPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.sw-success-icon {
  width: 56px;
  height: 56px;
  color: #D4AF37;
  display: inline-block;
  animation: sw-checkmark 0.8s ease-out 0.3s both;
}

@keyframes sw-checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.sw-success-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
  animation: sw-textSlideUp 0.6s ease-out 0.4s both;
}

.sw-success-text {
  font-size: 17px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 36px;
  animation: sw-textSlideUp 0.6s ease-out 0.5s both;
}

@keyframes sw-textSlideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sw-success-btn {
  margin-top: 12px;
  animation: sw-textSlideUp 0.6s ease-out 0.6s both;
}
</style>

