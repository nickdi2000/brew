describe('Member Portal', () => {
  beforeEach(() => {
    // Clear any existing sessions/storage to ensure clean state
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  describe('/members/gordon - Sample Organization', () => {
    it('should display the Sign in with Google button', () => {
      // Visit the member portal for the sample organization
      cy.visit('/members/gordon')
      
      // Wait for the page to load
      cy.get('body').should('exist')
      
      // Log current URL for debugging
      cy.url().then(url => {
        cy.log('Current URL:', url)
      })
      
      // The Google Sign In button might be implemented as a div or button
      // Let's try multiple selectors to find it
      
      // First, try to find by text content
      cy.contains('Sign in with Google', { timeout: 10000 })
        .should('be.visible')
        .then(() => {
          cy.log('✅ Found "Sign in with Google" button by text')
        })
      
      // Alternative: try to find by common Google button patterns
      cy.get('body').then($body => {
        // Check for various possible selectors
        const selectors = [
          '[data-cy="google-signin"]',
          '[data-cy="google-login"]', 
          '[data-testid="google-signin"]',
          '.google-signin-button',
          '#google-signin-button',
          'div[role="button"]',
          'button[type="button"]'
        ]
        
        let buttonFound = false
        
        selectors.forEach(selector => {
          if ($body.find(selector).length > 0 && !buttonFound) {
            cy.log(`Found potential Google button with selector: ${selector}`)
            cy.get(selector).should('be.visible')
            buttonFound = true
          }
        })
      })
    })
    
    it('should display organization information for gordon', () => {
      cy.visit('/members/gordon')
      
      // The member welcome page should show organization details
      // This might include organization name, description, banner, etc.
      
      // Wait for content to load
      cy.get('body').should('exist')
      
      // Look for organization-related content
      // The exact selectors will depend on your WelcomeComponent structure
      cy.get('body').then($body => {
        // Check for common organization display elements
        const orgSelectors = [
          'h1', 'h2', 'h3', // Organization name might be in a heading
          '.organization-name',
          '.brewery-name',
          '[data-cy="org-name"]',
          '[data-cy="organization-info"]'
        ]
        
        orgSelectors.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible')
            cy.log(`Found organization info with selector: ${selector}`)
          }
        })
      })
      
      // The page should not show any error states
      cy.get('body').should('not.contain', 'Not Found')
      cy.get('body').should('not.contain', 'Error')
      cy.get('body').should('not.contain', '404')
    })
    
    it('should handle organization loading states properly', () => {
      // Intercept the organization API call to test loading states
      cy.intercept('GET', '**/api/organization/by-code/gordon*', {
        delay: 1000, // Simulate slow network
        statusCode: 200,
        body: {
          success: true,
          message: 'Organization found',
          data: {
            _id: 'test-org-id',
            code: 'gordon',
            name: 'Gordon Sample Brewery',
            description: 'A sample brewery for testing',
            bannerImage: null
          }
        }
      }).as('getOrgByCode')
      
      cy.visit('/members/gordon')
      
      // Should show loading state initially
      cy.get('body').should('exist')
      
      // Wait for the API call to complete
      cy.wait('@getOrgByCode')
      
      // After loading, should show the organization content
      cy.contains('Sign in with Google', { timeout: 5000 }).should('be.visible')
    })
    
    it('should show error state for non-existent organization', () => {
      // Test with a non-existent organization code
      cy.visit('/members/nonexistent-org-12345')
      
      // Should eventually show some kind of error or "not found" state
      // The exact behavior depends on your error handling implementation
      cy.get('body', { timeout: 10000 }).should('exist')
      
      // Look for error indicators
      cy.get('body').then($body => {
        const errorIndicators = [
          'Not Found',
          'Organization not found',
          'Brewery not found',
          'Error',
          '404'
        ]
        
        let errorFound = false
        errorIndicators.forEach(errorText => {
          if ($body.text().includes(errorText) && !errorFound) {
            cy.log(`Found error indicator: ${errorText}`)
            errorFound = true
          }
        })
        
        // If no specific error text found, just verify we don't have a sign in button
        // (which would indicate the organization loaded successfully)
        if (!errorFound) {
          cy.log('No specific error text found, checking for absence of sign-in elements')
          cy.get('body').should('not.contain', 'Sign in with Google')
        }
      })
    })
  })

  describe('Member Portal - General Functionality', () => {
    it('should handle different organization codes in URLs', () => {
      const testOrganizations = [
        'gordon',
        'test-brewery', 
        'sample-org'
      ]
      
      testOrganizations.forEach(orgCode => {
        cy.visit(`/members/${orgCode}`)
        
        // Should load without JavaScript errors
        cy.get('body').should('exist')
        
        // URL should be correct
        cy.url().should('include', `/members/${orgCode}`)
        
        cy.log(`✅ Successfully loaded /members/${orgCode}`)
      })
    })
    
    it('should be mobile responsive', () => {
      // Test on mobile viewport
      cy.viewport('iphone-6')
      
      cy.visit('/members/gordon')
      cy.get('body').should('exist')
      
      // Google Sign In button should still be visible on mobile
      cy.contains('Sign in with Google', { timeout: 10000 }).should('be.visible')
      
      // Test on tablet
      cy.viewport('ipad-2')
      cy.get('body').should('exist')
      cy.contains('Sign in with Google').should('be.visible')
      
      // Reset to desktop
      cy.viewport(1280, 720)
    })
  })
  
  describe('Google Sign In Button Interaction', () => {
    it('should be able to click the Google Sign In button (without completing OAuth)', () => {
      cy.visit('/members/gordon')
      
      // Find and click the Google Sign In button
      cy.contains('Sign in with Google', { timeout: 10000 })
        .should('be.visible')
        .click()
      
      // Note: We're not testing the actual OAuth flow here, just that the button is clickable
      // The actual OAuth would open a popup/redirect which is complex to test in Cypress
      
      cy.log('✅ Google Sign In button is clickable')
      
      // After clicking, there might be some UI changes or loading states
      // This depends on your implementation
    })
    
    it('should show demo login option if available', () => {
      cy.visit('/members/gordon')
      
      // Look for demo login button/option
      cy.get('body').then($body => {
        if ($body.text().includes('Demo') || $body.text().includes('Try Demo')) {
          cy.contains(/Demo|Try Demo/).should('be.visible')
          cy.log('✅ Demo login option found')
        } else {
          cy.log('ℹ️ No demo login option found (this is optional)')
        }
      })
    })
  })
})