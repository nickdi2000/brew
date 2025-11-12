import { defineConfig } from 'cypress'

/**
 * Cypress configuration for post-deployment production smoke tests
 * 
 * This config is used by CI/CD to run smoke tests against the production environment
 * after deployment to verify critical functionality.
 */
export default defineConfig({
  e2e: {
    // Production URL
    baseUrl: process.env.PRODUCTION_BASE_URL || 'https://brewtokens.com',
    
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Capture evidence of failures
    video: true,
    screenshotOnRunFailure: true,
    
    // Increased timeouts for production (may be slower than local)
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Allow HTTPS
    chromeWebSecurity: false,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    env: {
      // Production API URL
      API_URL: process.env.PRODUCTION_API_URL || 'https://brewtokens.com/api',
      PRODUCTION_API_URL: process.env.PRODUCTION_API_URL || 'https://brewtokens.com/api',
      
      // Test credentials (should be set via GitHub Secrets)
      TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || '',
      TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || ''
    },
    
    // Only run smoke tests
    specPattern: 'cypress/e2e/smoke-tests-production.cy.js',
    supportFile: 'cypress/support/e2e.js',
    
    // Retry failed tests once (in case of network issues)
    retries: {
      runMode: 2,
      openMode: 0
    }
  }
})

