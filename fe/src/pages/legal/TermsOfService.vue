<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="prose prose-amber max-w-none">
          <h1>Terms of Service</h1>
          <p class="text-gray-600">Last updated: {{ new Date().toLocaleDateString() }}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using BrewTokens ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            BrewTokens is a digital rewards platform that enables breweries to create and manage loyalty programs for their customers. The Service includes features for tracking visits, earning rewards, and managing member benefits.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must register for an account. You agree to provide accurate and complete information when creating your account and to keep this information up to date.
          </p>

          <h2>4. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our 
            <router-link to="/privacy-policy" class="text-amber-600 hover:text-amber-700">Privacy Policy</router-link>
            to understand how we collect, use, and protect your personal information.
          </p>

          <h2>5. Rewards and Points</h2>
          <p>
            Points and rewards earned through the Service have no cash value and cannot be exchanged for cash. Points may expire according to individual brewery policies. We reserve the right to modify the rewards program at any time.
          </p>

          <h2>6. Prohibited Activities</h2>
          <p>
            Users agree not to:
          </p>
          <ul>
            <li>Attempt to circumvent or manipulate the rewards system</li>
            <li>Create multiple accounts for the same person</li>
            <li>Share or transfer points between accounts</li>
            <li>Use the Service for any unlawful purpose</li>
          </ul>

          <h2>7. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account at any time for any reason, including violation of these Terms of Service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@brewtokens.com.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>
