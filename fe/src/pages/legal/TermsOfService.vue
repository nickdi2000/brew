<template>
  <LegalPageLayout title="Terms of Service" :last-updated="lastUpdated">
    <div class="space-y-12 text-gray-700 leading-relaxed">
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">1. Acceptance of Terms</h2>
        <p>
          By accessing and using BrewTokens ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms,
          please do not use the Service.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">2. Description of Service</h2>
        <p>
          BrewTokens is a digital rewards platform enabling breweries to create and manage loyalty programs for their customers. The Service
          includes features for tracking visits, earning rewards, and managing member benefits.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">3. User Accounts</h2>
        <p>
          To use certain features of the Service, you must register for an account. You agree to provide accurate and complete information when
          creating your account and to keep this information up to date.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">4. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our
          <router-link to="/privacy-policy" class="text-amber-600 font-medium hover:text-amber-700">Privacy Policy</router-link>
          to understand how we collect, use, and protect your personal information.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">5. Rewards and Points</h2>
        <p>
          Points and rewards earned through the Service have no cash value and cannot be exchanged for cash. Points may expire according to
          individual brewery policies. We reserve the right to modify the rewards program at any time.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">6. Prohibited Activities</h2>
        <p class="text-gray-700">
          Users agree not to engage in activities including, but not limited to:
        </p>
        <ul class="list-disc list-outside pl-6 space-y-2">
          <li>Attempting to circumvent or manipulate the rewards system</li>
          <li>Creating multiple accounts for the same person</li>
          <li>Sharing or transferring points between accounts</li>
          <li>Using the Service for any unlawful purpose</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account at any time for any reason, including violation of these Terms of Service.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">8. Changes to Terms</h2>
        <p>
          We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">9. Contact Us</h2>
        <div class="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-6">
          <p>If you have any questions about these Terms of Service, please contact us at <strong>support@brewtokens.com</strong>.</p>
        </div>
      </section>
    </div>
  </LegalPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import LegalPageLayout from '@/components/legal/LegalPageLayout.vue'

const lastUpdated = ref(new Date())
</script>
