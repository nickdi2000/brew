// ***********************************************
// Custom commands for BrewTokens testing
// ***********************************************

/**
 * Custom command to log in to the admin portal
 * @param {string} email - User email (defaults to test user)
 * @param {string} password - User password (defaults to test password)
 */
Cypress.Commands.add('loginAdmin', (email, password) => {
  const userEmail = email || Cypress.env('TEST_USER_EMAIL')
  const userPassword = password || Cypress.env('TEST_USER_PASSWORD')
  
  cy.session([userEmail, userPassword], () => {
    cy.visit('/login')
    
    // Wait for login form to be visible
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Fill in login credentials
    cy.get('[data-cy="email-input"]').type(userEmail)
    cy.get('[data-cy="password-input"]').type(userPassword)
    
    // Click login button
    cy.get('[data-cy="login-button"]').click()
    
    // Wait for successful login (redirect to dashboard)
    cy.url().should('include', '/admin/dashboard')
    cy.get('h1').should('contain.text', 'Dashboard')
  }, {
    validate() {
      // Validate that we're still logged in
      cy.visit('/admin/dashboard')
      cy.get('h1').should('contain.text', 'Dashboard')
    }
  })
})

/**
 * Custom command to logout from admin portal
 */
Cypress.Commands.add('logoutAdmin', () => {
  cy.window().then((win) => {
    // Clear localStorage and sessionStorage
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
  
  // Visit login page to ensure we're logged out
  cy.visit('/login')
  cy.get('[data-cy="login-form"]').should('be.visible')
})

/**
 * Custom command to wait for API requests to complete
 */
Cypress.Commands.add('waitForApiRequests', () => {
  cy.wait('@getCurrentUser', { timeout: 10000 })
})

/**
 * Custom command to intercept auth/me requests for debugging
 */
Cypress.Commands.add('interceptAuthMe', () => {
  let callCount = 0
  
  cy.intercept('GET', '**/api/auth/me', (req) => {
    callCount++
    console.log(`auth/me call #${callCount}`, {
      url: req.url,
      headers: req.headers,
      timestamp: new Date().toISOString()
    })
  }).as('authMeCall')
  
  // Return call count for assertions
  cy.wrap(() => callCount).as('getAuthCallCount')
})

/**
 * Custom command to check for duplicate API calls
 */
Cypress.Commands.add('checkNoDuplicateAuthCalls', (maxExpected = 1) => {
  cy.get('@authMeCall.all').then((calls) => {
    expect(calls.length).to.be.at.most(maxExpected, `Expected at most ${maxExpected} auth/me call(s), but found ${calls.length}`)
  })
})

/**
 * Debug command to check Cypress environment and configuration
 */
Cypress.Commands.add('debugEnvironment', () => {
  cy.log('🐛 Debugging Cypress Environment')
  cy.log('Base URL:', Cypress.config('baseUrl'))
  cy.log('API URL:', Cypress.env('API_URL'))
  cy.log('Test User Email:', Cypress.env('TEST_USER_EMAIL'))
  cy.log('Chrome Web Security:', Cypress.config('chromeWebSecurity'))
  
  // Test server connectivity
  cy.request({
    method: 'GET',
    url: Cypress.config('baseUrl'),
    failOnStatusCode: false,
    timeout: 5000
  }).then((response) => {
    cy.log('Server Response Status:', response.status)
    cy.log('Server Response Headers:', response.headers)
  })
})

/**
 * Visit a member portal for a specific organization
 * @param {string} orgCode - The organization code (e.g., 'gordon')
 */
Cypress.Commands.add('visitMemberPortal', (orgCode) => {
  cy.log(`🏢 Visiting member portal for: ${orgCode}`)
  cy.visit(`/members/${orgCode}`)
  
  // Wait for page to load
  cy.get('body').should('exist')
  
  // Log current URL for debugging
  cy.url().should('include', `/members/${orgCode}`)
})

/**
 * Find the Google Sign In button using multiple strategies
 */
Cypress.Commands.add('findGoogleSignInButton', () => {
  cy.log('🔍 Looking for Google Sign In button...')
  
  // First try by text content (most reliable)
  cy.get('body').then($body => {
    if ($body.text().includes('Sign in with Google')) {
      return cy.contains('Sign in with Google').should('be.visible')
    }
    
    // Try other common Google button text variations
    const googleTexts = [
      'Continue with Google',
      'Login with Google', 
      'Sign in with Google',
      'Google Sign In'
    ]
    
    let found = false
    googleTexts.forEach(text => {
      if ($body.text().includes(text) && !found) {
        cy.contains(text).should('be.visible')
        found = true
      }
    })
    
    // If no text found, try by common selectors
    if (!found) {
      const selectors = [
        '[data-cy="google-signin"]',
        '[data-cy="google-login"]',
        '.google-signin-button',
        '#google-signin-button',
        'div[role="button"]',
        'button[type="button"]'
      ]
      
      selectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !found) {
          cy.get(selector).should('be.visible')
          found = true
        }
      })
    }
    
    if (!found) {
      throw new Error('Google Sign In button not found')
    }
  })
})

/**
 * Check if an organization page loaded successfully
 */
Cypress.Commands.add('verifyOrganizationLoaded', () => {
  cy.log('🏢 Verifying organization loaded successfully...')
  
  // Should not show error states
  cy.get('body').should('not.contain', 'Not Found')
  cy.get('body').should('not.contain', 'Organization not found')
  cy.get('body').should('not.contain', 'Brewery not found')
  cy.get('body').should('not.contain', '404')
  
  // Should show sign in options (indicating org loaded successfully)
  cy.findGoogleSignInButton()
})
