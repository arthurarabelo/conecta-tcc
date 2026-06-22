describe('Proposal Detail Page', () => {
  const EMPTY_APPS = {
    data: [],
    meta: { current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null },
    links: { first: null, last: null, prev: null, next: null },
  }

  beforeEach(() => {
    cy.intercept('GET', '**/api/proposals/**').as('getProposal')
    // Stub applications by default (unauthenticated requests hit 401 → redirect)
    // Authenticated tests that need real data override this below
  })

  function stubApplications() {
    cy.intercept('GET', '**/api/applications*', { body: EMPTY_APPS, statusCode: 200 }).as('getApplications')
  }

  function allowApplications() {
    cy.intercept('GET', '**/api/applications*').as('getApplications')
  }

  it('loads the detail page correctly', () => {
    stubApplications()
    cy.visit('/propostas/1')
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('be.visible')
    cy.contains('Sobre o projeto').should('be.visible')
    cy.contains('Professor Teste').should('be.visible')
  })

  it('shows not-found page for non-existent proposal', () => {
    stubApplications()
    cy.visit('/propostas/99999')
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Proposta não encontrada').should('be.visible')
  })

  it('student can apply to a proposal', () => {
    allowApplications()
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/2') // Blockchain — no application yet
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Candidatar-se').click()
    cy.contains(/candidatura enviada/i).should('be.visible')
    cy.contains('Em análise').should('be.visible')
  })

  it('does not allow applying twice', () => {
    allowApplications()
    cy.loginByApi('student@test.com', 'password123')
    // Proposal 1 already has a pending application from seed
    cy.visit('/propostas/1')
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Em análise').should('be.visible')
    cy.contains('button', 'Candidatar-se').should('not.exist')
  })

  it('closed proposal cannot be applied to', () => {
    allowApplications()
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/3') // status: closed in seed
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Proposta encerrada').should('be.visible').and('be.disabled')
  })

  it('unauthenticated user sees login prompt', () => {
    stubApplications()
    cy.visit('/propostas/1')
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Entrar para se candidatar').should('be.visible')
  })

  it('professor sees edit button on own proposal', () => {
    allowApplications()
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1') // owned by professor@test.com in seed
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Editar').should('be.visible')
  })

  it('professor does NOT see edit on others proposals', () => {
    allowApplications()
    cy.loginByApi('professor2@test.com', 'password123')
    cy.visit('/propostas/1') // owned by professor@test.com, not professor2
    cy.wait('@getProposal')
    cy.wait('@getApplications')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Editar').should('not.exist')
  })
})
