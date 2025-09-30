// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can read more about Cypress support files here:
// https://on.cypress.io/configuration#e2e
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in Cypress command log to reduce noise
Cypress.on('window:before:load', (win) => {
  // Disable service workers
  delete win.navigator.serviceWorker
})

// Handle SSL certificate errors and uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful for SSL certificate errors in development
  if (err.message.includes('certificate') || 
      err.message.includes('SSL') ||
      err.message.includes('security') ||
      err.message.includes('fetch')) {
    console.warn('SSL/Network error caught:', err.message)
    return false
  }
  // Let other errors fail the test
  return true
})

// Global configuration
beforeEach(() => {
  // Intercept and ignore favicon requests to avoid 404 errors
  cy.intercept('GET', '/favicon.ico', { statusCode: 204 })
  
  // Set up API request interceptions for debugging
  cy.intercept('POST', '**/api/auth/**').as('authRequest')
  cy.intercept('GET', '**/api/auth/me').as('getCurrentUser')
  
  // Handle potential SSL warnings by visiting the page first
  cy.log('🔒 Handling potential SSL certificate warnings...')
})
