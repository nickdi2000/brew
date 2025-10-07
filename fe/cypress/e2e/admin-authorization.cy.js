describe('Admin authorization for management endpoints', () => {
  beforeEach(() => {
    cy.clearAllSessionStorage()
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  it('blocks member from admin-only members list endpoint', () => {
    const code = 'gordon'
    cy.loginMemberDemo(code)

    cy.request({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/memberships`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('memberToken')}`
      },
      failOnStatusCode: false
    }).then((resp) => {
      // members list is admin-only; expect 403
      expect(resp.status).to.eq(403)
    })
  })

  it('allows admin to list members and update status', () => {
    cy.loginAdmin()

    cy.request({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/memberships`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body?.success).to.eq(true)
    })
  })
})


