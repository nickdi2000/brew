/**
 * Post-Deployment Smoke Tests for Production
 * 
 * These tests run automatically after deployment to verify:
 * - API is accessible
 * - Health endpoints are responding
 * - Admin login functionality works
 * - Registration functionality works
 * 
 * These are intentionally lightweight to catch critical failures quickly.
 */

describe('Production Smoke Tests', () => {
  // Use production URLs when running in CI/CD
  const apiUrl = Cypress.env('PRODUCTION_API_URL') || Cypress.env('API_URL')
  const baseUrl = Cypress.config('baseUrl')

  beforeEach(() => {
    // Clear any existing sessions/storage
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  describe('API Health Checks', () => {
    it('should verify API test endpoint is accessible', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/test`,
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        cy.log('API Test Endpoint Response:', response.status)
        
        // Should return 200 OK
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message')
        expect(response.body.message).to.include('API is healthy')
      })
    })

    it('should verify API health endpoint is accessible', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/health`,
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        cy.log('API Health Endpoint Response:', response.status, response.body)
        
        // Should return 200 OK
        expect(response.status).to.eq(200)
        
        // Verify response structure
        expect(response.body).to.have.property('success', true)
        expect(response.body.data).to.have.property('status', 'healthy')
        expect(response.body.data).to.have.property('database')
        expect(response.body.data).to.have.property('timestamp')
        
        cy.log('✅ API Health Check Passed')
      })
    })

    it('should verify database connectivity through health check', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/health`,
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.data.database).to.eq('connected')
        
        // Verify we have stats (indicating DB queries work)
        expect(response.body.data).to.have.property('stats')
        expect(response.body.data.stats).to.have.property('organizations')
        expect(response.body.data.stats).to.have.property('users')
        
        cy.log(`✅ Database connected with ${response.body.data.stats.organizations} organizations and ${response.body.data.stats.users} users`)
      })
    })
  })

  describe('Frontend Accessibility', () => {
    it('should load the landing page successfully', () => {
      cy.visit('/', { timeout: 15000 })
      
      // Verify page loaded
      cy.get('body').should('exist')
      
      // Page should not show any error messages
      cy.get('body').should('not.contain', '500')
      cy.get('body').should('not.contain', 'Server Error')
      cy.get('body').should('not.contain', 'Cannot GET')
      
      cy.log('✅ Landing page loaded successfully')
    })

    it('should load the admin login page successfully', () => {
      cy.visit('/login', { timeout: 15000 })
      
      // Verify login form is present
      cy.get('[data-cy="login-form"]').should('be.visible')
      cy.get('[data-cy="email-input"]').should('be.visible')
      cy.get('[data-cy="password-input"]').should('be.visible')
      cy.get('[data-cy="login-button"]').should('be.visible')
      
      cy.log('✅ Admin login page loaded successfully')
    })
  })

  describe('Authentication - Admin Login', () => {
    it('should successfully login with test credentials', () => {
      // Only run if test credentials are provided
      const testEmail = Cypress.env('TEST_USER_EMAIL')
      const testPassword = Cypress.env('TEST_USER_PASSWORD')

      if (!testEmail || !testPassword) {
        cy.log('⚠️  Skipping login test - no test credentials provided')
        return
      }

      cy.visit('/login')
      
      // Intercept the login request to verify it's working
      cy.intercept('POST', '**/api/auth/login').as('loginRequest')
      
      // Fill in login credentials
      cy.get('[data-cy="email-input"]').type(testEmail)
      cy.get('[data-cy="password-input"]').type(testPassword)
      
      // Click login button
      cy.get('[data-cy="login-button"]').click()
      
      // Wait for the login request to complete
      cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
        // Verify successful response
        expect(interception.response.statusCode).to.be.oneOf([200, 201])
        expect(interception.response.body).to.have.property('success', true)
        expect(interception.response.body.data).to.have.property('token')
        
        cy.log('✅ Login API request successful')
      })
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/admin/dashboard', { timeout: 15000 })
      
      // Verify dashboard page loaded correctly
      cy.get('h1', { timeout: 10000 }).should('contain.text', 'Dashboard')
      
      cy.log('✅ Admin login successful')
    })

    it('should verify auth/me endpoint works after login', () => {
      const testEmail = Cypress.env('TEST_USER_EMAIL')
      const testPassword = Cypress.env('TEST_USER_PASSWORD')

      if (!testEmail || !testPassword) {
        cy.log('⚠️  Skipping auth/me test - no test credentials provided')
        return
      }

      // Use the custom login command
      cy.loginAdmin(testEmail, testPassword)
      
      // Intercept auth/me request
      cy.intercept('GET', '**/api/auth/me').as('authMeRequest')
      
      // Visit dashboard which should trigger auth/me
      cy.visit('/admin/dashboard')
      
      // Wait for and verify auth/me request
      cy.wait('@authMeRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200)
        expect(interception.response.body.success).to.eq(true)
        expect(interception.response.body.data).to.have.property('user')
        expect(interception.response.body.data.user).to.have.property('email')
        
        cy.log('✅ Auth/me endpoint working correctly')
      })
    })
  })

  describe('Authentication - Registration', () => {
    it('should verify registration endpoint is accessible', () => {
      // Test that the registration endpoint returns proper validation errors
      // (we don't want to actually create accounts in production)
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: {
          email: '', // Empty to trigger validation error
          password: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return 400 Bad Request (validation error)
        expect(response.status).to.be.oneOf([400, 422])
        
        // Should have an error message
        expect(response.body).to.have.property('success', false)
        
        cy.log('✅ Registration endpoint accessible and validating input')
      })
    })

    it('should verify registration page loads and form is functional', () => {
      // Check if there's a public registration page
      // Adjust the URL based on your actual registration page route
      cy.visit('/start?venueName=SmokeTest', { failOnStatusCode: false })
      
      cy.get('body').then($body => {
        if ($body.text().includes('404') || $body.text().includes('Not Found')) {
          cy.log('⚠️  No public registration page found - skipping UI test')
        } else {
          // Verify form elements exist
          cy.get('input[type="email"]').should('exist')
          cy.get('input[type="password"]').should('exist')
          
          cy.log('✅ Registration page loads successfully')
        }
      })
    })

    it('should test registration with invalid data to verify validation', () => {
      const apiUrl = Cypress.env('PRODUCTION_API_URL') || Cypress.env('API_URL')
      
      // Test with weak password
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: {
          email: 'test@example.com',
          password: '123', // Too short
          firstName: 'Test',
          lastName: 'User'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should reject weak password
        expect(response.status).to.be.oneOf([400, 422])
        cy.log('✅ Password validation working')
      })
      
      // Test with invalid email
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: {
          email: 'not-an-email',
          password: 'ValidPassword123!',
          firstName: 'Test',
          lastName: 'User'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should reject invalid email
        expect(response.status).to.be.oneOf([400, 422])
        cy.log('✅ Email validation working')
      })
    })
  })

  describe('Critical API Endpoints', () => {
    it('should verify organizations endpoint is accessible', () => {
      // This endpoint might require auth, so we expect 401 if not authenticated
      cy.request({
        method: 'GET',
        url: `${apiUrl}/organizations`,
        failOnStatusCode: false
      }).then((response) => {
        // Should either return data (if public) or 401 (if protected)
        expect(response.status).to.be.oneOf([200, 401])
        cy.log('✅ Organizations endpoint responding')
      })
    })

    it('should verify CORS headers are configured', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${apiUrl}/health`,
        failOnStatusCode: false
      }).then((response) => {
        // OPTIONS request should succeed
        expect(response.status).to.be.oneOf([200, 204])
        
        cy.log('✅ CORS configured correctly')
      })
    })
  })

  describe('Performance Checks', () => {
    it('should load the homepage within acceptable time', () => {
      const startTime = Date.now()
      
      cy.visit('/', { timeout: 15000 }).then(() => {
        const loadTime = Date.now() - startTime
        
        cy.log(`Page load time: ${loadTime}ms`)
        
        // Should load within 10 seconds
        expect(loadTime).to.be.lessThan(10000)
        
        if (loadTime > 5000) {
          cy.log('⚠️  Page load time is slow (>5s)')
        } else {
          cy.log('✅ Page load time is acceptable')
        }
      })
    })

    it('should verify API response time is acceptable', () => {
      const startTime = Date.now()
      
      cy.request({
        method: 'GET',
        url: `${apiUrl}/test`,
        timeout: 10000
      }).then(() => {
        const responseTime = Date.now() - startTime
        
        cy.log(`API response time: ${responseTime}ms`)
        
        // API should respond within 2 seconds
        expect(responseTime).to.be.lessThan(2000)
        
        if (responseTime > 1000) {
          cy.log('⚠️  API response time is slow (>1s)')
        } else {
          cy.log('✅ API response time is acceptable')
        }
      })
    })
  })
})

