<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">BrewTokens Guide</h1>

      <!-- Purpose Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Icon icon="mdi:lightbulb" class="h-6 w-6 mr-2 text-amber-500" />
          Purpose & Core Idea
        </h2>
        <div class="prose prose-slate max-w-none">
          <p class="text-slate-600 leading-relaxed">
            BrewTokens is a rewards platform that revolutionizes customer loyalty programs. It allows customers to earn points 
            with every purchase or designated action, which they can later redeem for exciting rewards like free beverages, 
            event access, discounts, and more.
          </p>
          <p class="text-slate-600 leading-relaxed mt-4">
            What makes BrewTokens unique is its seamless integration capability - your business can implement it without any 
            complex technology infrastructure. The entire system operates through QR codes, making it incredibly user-friendly 
            for both customers and staff.
          </p>
        </div>
      </section>

      <!-- Member Flow Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Icon icon="mdi:account-group" class="h-6 w-6 mr-2 text-blue-500" />
          Member Experience
        </h2>
        <div class="prose prose-slate max-w-none">
          <p class="text-slate-600 leading-relaxed">
            Members don't need to download any apps - everything works through their Google SSO login, enabling registration 
            in seconds. A first-time member can complete their purchase, register, and earn points all within 10-20 seconds.
          </p>
          <p class="text-slate-600 leading-relaxed mt-4">
            The system employs advanced encryption techniques to ensure security and prevent any unauthorized point accumulation.
          </p>
        </div>
      </section>

      <!-- QR Codes Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Icon icon="mdi:qrcode" class="h-6 w-6 mr-2 text-indigo-500" />
          QR Code System
        </h2>
        <div class="bg-slate-50 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-medium text-slate-800 mb-3">Two Types of QR Codes:</h3>
          <div class="space-y-4">
            <div class="flex items-start">
              <Icon icon="mdi:door-open" class="h-5 w-5 mr-3 text-green-500 mt-1" />
              <div>
                <h4 class="font-medium text-slate-800">Portal Access</h4>
                <p class="text-slate-600">Enables quick member login/registration. Perfect for public display to streamline the access process.</p>
              </div>
            </div>
            <div class="flex items-start">
              <Icon icon="mdi:star" class="h-5 w-5 mr-3 text-amber-500 mt-1" />
              <div>
                <h4 class="font-medium text-slate-800">Award Points</h4>
                <p class="text-slate-600">Used to award points after purchases. These codes should be kept secure with staff members.</p>
              </div>
            </div>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Award Points QR codes also function as portal access codes, offering flexibility in implementation. Choose between 
          using a single code or separating them based on your business needs and security preferences.
        </p>
      </section>

      <!-- Organization Setup Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Icon icon="mdi:cog" class="h-6 w-6 mr-2 text-gray-500" />
          Organization Setup
        </h2>
        <div class="prose prose-slate max-w-none">
          <p class="text-slate-600 leading-relaxed">
            Customize your members' portal through the organization settings page at <code class="bg-slate-100 px-2 py-1 rounded">/admin/settings</code>. 
            You can personalize:
          </p>
          <ul class="list-disc list-inside text-slate-600 mt-3">
            <li>Title</li>
            <li>Description</li>
            <li>Banner image</li>
          </ul>
        </div>
      </section>

      <!-- Rewards Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
          <Icon icon="mdi:gift" class="h-6 w-6 mr-2 text-rose-500" />
          Rewards Management
        </h2>
        <div class="prose prose-slate max-w-none">
          <p class="text-slate-600 leading-relaxed">
            Configure your rewards program at <code class="bg-slate-100 px-2 py-1 rounded">/admin/rewards</code>. For each reward, you can set:
          </p>
          <ul class="list-disc list-inside text-slate-600 mt-3">
            <li>Name (e.g., "Free IPA")</li>
            <li>Point cost for redemption</li>
            <li>Expiration date</li>
            <li>Stock quantity</li>
            <li>Status (active/inactive)</li>
          </ul>
        </div>
      </section>

      <!-- Quick Links -->
      <section class="bg-slate-50 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Quick Navigation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <router-link 
            v-for="link in quickLinks" 
            :key="link.route" 
            :to="{ name: link.route }"
            class="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150"
          >
            <Icon :icon="link.icon" class="h-5 w-5 mr-3 text-slate-600" />
            <span class="font-medium text-slate-700">{{ link.name }}</span>
          </router-link>
        </div>
      </section>
    </div>
    
    <!-- Footer CTA -->
    <div class="mt-6 flex justify-end">
      <router-link to="/admin/contact" class="btn btn-primary inline-flex items-center">
        <Icon icon="mdi:email" class="h-5 w-5 mr-2" />
        Contact BrewTokens
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const quickLinks = [
  { name: 'QR Codes', route: 'qr-codes', icon: 'mdi:qrcode' },
  { name: 'Settings', route: 'settings', icon: 'mdi:cog' },
  { name: 'Rewards', route: 'rewards', icon: 'mdi:gift' },
  { name: 'Members', route: 'members', icon: 'mdi:account-group' }
]
</script>
