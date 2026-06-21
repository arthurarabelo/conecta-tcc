import './commands'

before(() => {
  // Verify backend is healthy before running any tests
  cy.request('GET', `${Cypress.env('apiBaseUrl')}/proposals`)
    .its('status')
    .should('eq', 200)
})

beforeEach(() => {
  // Each test starts with a clean database
  cy.resetDb()
  // Clear any leftover auth state
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token')
    win.localStorage.removeItem('conecta-tcc-auth')
  })
})
