describe('Member Portal - Gordon Organization', () => {
  beforeEach(() => {
    // Clear storage to ensure clean state
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('should show "Sign in with Google" button on /members/gordon', () => {
    // Visit the Gordon organization member portal
    cy.visitMemberPortal('gordon')
    
    // Verify the page loaded successfully
    cy.verifyOrganizationLoaded()
    
    // The main test - verify Google Sign In button is present (but don't click it)
    cy.findGoogleSignInButton()
    
    cy.log('✅ Successfully found Google Sign In button on /members/gordon')
  })
  
  it('should display organization information for Gordon', () => {
    cy.visit('/members/gordon')
    
    // Wait for content to load
    cy.get('body').should('exist')
    
    // Look for any organization-related headings or content
    cy.get('body').then($body => {
      // The page should have some content indicating the organization loaded
      const hasContent = $body.find('h1, h2, h3').length > 0 || 
                        $body.text().includes('Gordon') ||
                        $body.text().includes('Sign in')
      
      expect(hasContent).to.be.true
      cy.log('✅ Organization content found on page')
    })
  })
  
  it('should be able to demo login and see welcome message', () => {
    cy.visit('/members/gordon')
    
    // Wait for the page to load
    cy.get('body').should('exist')
    
    // Look for and click the Demo Login button
    cy.contains('Demo Login', { timeout: 10000 })
      .should('be.visible')
      .click()
    
    // After demo login, we should see a welcome message
    cy.contains('Welcome back,', { timeout: 10000 })
      .should('be.visible')
    
    cy.log('✅ Demo login successful - welcome message displayed')
  })
  
  it('should show both Google Sign In and Demo Login options', () => {
    cy.visit('/members/gordon')
    
    // Verify both authentication options are present
    cy.contains('Sign in with Google', { timeout: 10000 })
      .should('be.visible')
    
    cy.contains('Demo Login', { timeout: 10000 })
      .should('be.visible')
    
    cy.log('✅ Both authentication options are available')
  })
})
