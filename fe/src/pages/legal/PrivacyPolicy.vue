<template>
  <LegalPageLayout title="Privacy Policy" :last-updated="lastUpdated">
    <div class="space-y-12 text-gray-700 leading-relaxed">
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">1. Introduction</h2>
        <p>
          This Privacy Policy explains how BrewTokens ("we", "us", or "our") collects, uses, and protects your personal information when you use
          our service.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">2. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul class="list-disc list-outside pl-6 space-y-2">
          <li>Name and contact information</li>
          <li>Account credentials</li>
          <li>Profile information</li>
          <li>Transaction and reward history</li>
          <li>Communication preferences</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul class="list-disc list-outside pl-6 space-y-2">
          <li>Provide and maintain the Service</li>
          <li>Process your transactions and rewards</li>
          <li>Send you important notifications</li>
          <li>Improve our services</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">4. Information Sharing</h2>
        <p>We share your information with:</p>
        <ul class="list-disc list-outside pl-6 space-y-2">
          <li>Partner breweries (only relevant reward information)</li>
          <li>Service providers who assist in operating our platform</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is
          100% secure.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul class="list-disc list-outside pl-6 space-y-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt out of marketing communications</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">7. Cookies and Tracking</h2>
        <p>
          We use cookies and similar technologies to enhance your experience and collect usage data. You can control cookie settings through your
          browser.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">8. Children's Privacy</h2>
        <p>Our Service is not intended for individuals under the age of 21. We do not knowingly collect information from children.</p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">9. Changes to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy periodically. We will notify you of any material changes through the Service or via email.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold text-gray-900 tracking-tight">10. Contact Us</h2>
        <div class="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-6 space-y-4">
          <p>If you have questions about this Privacy Policy, please contact us at <strong>privacy@brewtokens.com</strong>.</p>
          <p class="text-sm text-gray-600">
            For additional information about our privacy practices, you can also review our
            <router-link to="/terms-of-service" class="text-amber-600 font-medium hover:text-amber-700">Terms of Service</router-link>.
          </p>
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
