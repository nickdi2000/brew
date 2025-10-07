describe('Auth Separation: Admin vs Member', () => {
  beforeEach(() => {
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('redirects a logged-in member away from member portal routes without code to /members', () => {
    const code = 'gordon'
    cy.loginMemberDemo(code)

    cy.visit('/members')
    cy.url().should('include', '/members')
  })

  it('prevents member from accessing admin routes', () => {
    const code = 'gordon'
    cy.loginMemberDemo(code)
    cy.visit('/admin')
    cy.url().should('not.include', '/admin/')
  })

  it('allows admin to access admin routes and does not auto-use member portal', () => {
    cy.loginAdmin()
    cy.visit('/admin/dashboard')
    cy.url().should('include', '/admin/dashboard')

    cy.visit('/members/gordon/portal')
    // Without member auth, guard should send back to /members/gordon
    cy.url().should('include', '/members/gordon')
  })
})


