import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5644',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false, // Needed for HTTPS with self-signed certificates
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Environment variables for testing
      API_URL: 'https://192.168.0.201:3391/api',
      TEST_USER_EMAIL: 'sample@brewtokens.com',
      TEST_USER_PASSWORD: 'Password123!'
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js'
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
})