describe('Admin Login', () => {
  beforeEach(() => {
    // Clear any existing sessions/storage
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('should log in with sample user and navigate to dashboard', () => {
    // Intercept auth/me requests to track duplicate calls
    cy.interceptAuthMe()
    
    // Visit login page
    cy.visit('/login')
    
    // Verify login form is visible
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Fill in login credentials
    cy.get('[data-cy="email-input"]').type(Cypress.env('TEST_USER_EMAIL'))
    cy.get('[data-cy="password-input"]').type(Cypress.env('TEST_USER_PASSWORD'))
    
    // Click login button
    cy.get('[data-cy="login-button"]').click()
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/admin/dashboard', { timeout: 10000 })
    
    // Verify dashboard page loaded correctly
    cy.get('h1').should('contain.text', 'Dashboard')
    
    // Wait a moment for any additional auth/me calls
    cy.wait(2000)
    
    // Check for duplicate auth/me calls
    cy.get('@authMeCall.all').then((calls) => {
      cy.log(`Total auth/me calls: ${calls.length}`)
      
      // Log details of each call for debugging
      calls.forEach((call, index) => {
        cy.log(`Call ${index + 1}:`, {
          url: call.request.url,
          timestamp: new Date().toISOString()
        })
      })
      
      // This will help identify if there are duplicate calls
      if (calls.length > 1) {
        cy.log('⚠️  Multiple auth/me calls detected! Investigating...')
        
        // Check timing between calls
        if (calls.length >= 2) {
          const call1Time = new Date(calls[0].request.headers['x-timestamp'] || Date.now())
          const call2Time = new Date(calls[1].request.headers['x-timestamp'] || Date.now())
          const timeDiff = Math.abs(call2Time - call1Time)
          
          cy.log(`Time difference between first two calls: ${timeDiff}ms`)
        }
      }
    })
  })

  it('should investigate the source of duplicate auth/me calls', () => {
    // This test specifically focuses on identifying duplicate calls
    let authCallCount = 0
    
    cy.intercept('GET', '**/api/auth/me', (req) => {
      authCallCount++
      
      // Add timestamp to track when calls happen
      req.headers['x-test-call-number'] = authCallCount.toString()
      req.headers['x-test-timestamp'] = Date.now().toString()
      
      cy.log(`🔍 auth/me call #${authCallCount}`, {
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      })
    }).as('authMeDebug')
    
    // Visit login page
    cy.visit('/login')
    
    // Log in
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="email-input"]').type(Cypress.env('TEST_USER_EMAIL'))
    cy.get('[data-cy="password-input"]').type(Cypress.env('TEST_USER_PASSWORD'))
    cy.get('[data-cy="login-button"]').click()
    
    // Wait for dashboard to load
    cy.url().should('include', '/admin/dashboard')
    cy.get('h1').should('contain.text', 'Dashboard')
    
    // Wait for all auth calls to complete
    cy.wait(3000)
    
    // Analyze the calls
    cy.get('@authMeDebug.all').then((calls) => {
      expect(calls.length).to.be.at.most(2, `Found ${calls.length} auth/me calls - investigating why there are duplicates`)
      
      if (calls.length > 1) {
        cy.log('🚨 DUPLICATE AUTH/ME CALLS DETECTED!')
        cy.log(`Total calls: ${calls.length}`)
        
        // Log timing analysis
        calls.forEach((call, index) => {
          const callNumber = call.request.headers['x-test-call-number']
          const timestamp = call.request.headers['x-test-timestamp']
          cy.log(`Call ${index + 1}: #${callNumber} at ${new Date(parseInt(timestamp)).toISOString()}`)
        })
        
        // Check if calls are happening simultaneously or sequentially
        if (calls.length >= 2) {
          const time1 = parseInt(calls[0].request.headers['x-test-timestamp'])
          const time2 = parseInt(calls[1].request.headers['x-test-timestamp'])
          const timeDifference = Math.abs(time2 - time1)
          
          cy.log(`⏱️  Time between calls: ${timeDifference}ms`)
          
          if (timeDifference < 100) {
            cy.log('🔍 Calls are nearly simultaneous - likely from different components/hooks')
          } else {
            cy.log('🔍 Calls are sequential - likely from navigation guards or route changes')
          }
        }
      } else {
        cy.log('✅ Only one auth/me call detected - no duplicates!')
      }
    })
  })

  it('should successfully logout and clear session', () => {
    // First login
    cy.loginAdmin()
    
    // Verify we're on dashboard
    cy.visit('/admin/dashboard')
    cy.get('h1').should('contain.text', 'Dashboard')
    
    // Logout
    cy.logoutAdmin()
    
    // Verify we're logged out
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Try to access protected route - should redirect to login
    cy.visit('/admin/dashboard')
    cy.url().should('include', '/login')
  })
})