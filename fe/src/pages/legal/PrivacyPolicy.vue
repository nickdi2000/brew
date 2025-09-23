<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="prose prose-amber max-w-none">
          <h1>Privacy Policy</h1>
          <p class="text-gray-600">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how BrewTokens ("we", "us", or "our") collects, uses, and protects your personal information when you use our service.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Profile information</li>
            <li>Transaction and reward history</li>
            <li>Communication preferences</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process your transactions and rewards</li>
            <li>Send you important notifications</li>
            <li>Improve our services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>
            We share your information with:
          </p>
          <ul>
            <li>Partner breweries (only relevant reward information)</li>
            <li>Service providers who assist in operating our platform</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience and collect usage data. You can control cookie settings through your browser.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 21. We do not knowingly collect information from children.
          </p>

          <h2>9. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of any material changes through the Service or via email.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@brewtokens.com.
          </p>

          <div class="mt-8 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">
              For additional information about our privacy practices, you can also review our 
              <router-link to="/terms-of-service" class="text-amber-600 hover:text-amber-700">Terms of Service</router-link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>
