/// <reference types="cypress" />

const API_URL = Cypress.env('apiBaseUrl') || 'http://localhost:8000/api'

Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request('POST', `${API_URL}/login`, { email, password }).then((res) => {
    expect(res.status).to.eq(200)
    const { user, token } = res.body
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', token)
      win.localStorage.setItem(
        'conecta-tcc-auth',
        JSON.stringify({
          state: { user, token, isAuthenticated: true },
          version: 0,
        }),
      )
    })
  })
})

Cypress.Commands.add('resetDb', () => {
  cy.exec(
    'docker compose -f ../backend/compose.yaml exec -T app php artisan db:seed --class=E2ETestSeeder --force',
    { failOnNonZeroExit: false },
  )
})

Cypress.Commands.add('createProposalViaApi', (token: string, proposal: object) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/proposals`,
    headers: { Authorization: `Bearer ${token}` },
    body: proposal,
  }).then((res) => {
    expect(res.status).to.eq(201)
  })
})
