describe('Server Connectivity', () => {
  it('should be able to reach the frontend server', () => {
    // Visit the home page to verify server is running
    cy.visit('/')
    
    // Check if the page loads - could be any element that should exist
    cy.get('body').should('exist')
    
    // Log the current URL to verify we're on the right server
    cy.url().should('include', 'localhost:5644')
    
    // Check if we can reach the login page specifically
    cy.visit('/login')
    cy.get('body').should('exist')
    
    // Verify the login form exists (even if we don't test login here)
    cy.get('[data-cy="login-form"]', { timeout: 10000 }).should('exist')
    
    cy.log('✅ Server connectivity verified!')
  })
  
  it('should verify API endpoint is accessible', () => {
    // Test if we can reach the API health endpoint
    const apiUrl = Cypress.env('API_URL')
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/test`,
      failOnStatusCode: false // Don't fail if the endpoint returns an error
    }).then((response) => {
      // Log the response for debugging
      cy.log('API Response:', response.status, response.body)
      
      // We expect either 200 (success) or some other response indicating server is running
      expect([200, 401, 403, 404]).to.include(response.status)
    })
  })
})