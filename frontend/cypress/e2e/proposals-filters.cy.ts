describe('Proposals List', () => {
  beforeEach(() => {
    // Intercept the API call so we can wait for it
    cy.intercept('GET', '**/api/proposals*').as('getProposals')
    cy.visit('/propostas')
    cy.wait('@getProposals')
    // Now wait for cards to render
    cy.contains('Redes Neurais para Reconhecimento de Imagens', { timeout: 10000 }).should('be.visible')
  })

  it('loads the proposals page with proposal cards', () => {
    cy.contains('h1', 'Mural de Propostas').should('be.visible')
    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('be.visible')
    cy.contains('Blockchain para Certificação Acadêmica').should('be.visible')
    cy.contains('Proposta Finalizada de Teste').should('be.visible')
  })

  it('filters proposals by search text', () => {
    // Type in search input
    cy.get('input[placeholder="Buscar por título..."]').type('Redes')

    // Only matching proposal visible
    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('be.visible')
    cy.contains('Blockchain para Certificação Acadêmica').should('not.exist')
    cy.contains('Proposta Finalizada de Teste').should('not.exist')

    // Clear search
    cy.get('input[placeholder="Buscar por título..."]').clear()

    // All proposals visible again
    cy.contains('Blockchain para Certificação Acadêmica').should('be.visible')
  })

  it('filters by status (open only)', () => {
    // Check "Só abertas" checkbox
    cy.get('#only-open').click()

    // Only open proposals visible
    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('be.visible')
    cy.contains('Blockchain para Certificação Acadêmica').should('be.visible')
    cy.contains('Proposta Finalizada de Teste').should('not.exist')

    // Uncheck
    cy.get('#only-open').click()

    // Closed proposal back
    cy.contains('Proposta Finalizada de Teste').should('be.visible')
  })

  it('filters by department', () => {
    // Open department select
    cy.get('#dept-select').click()
    // Select "Sistemas de Informação"
    cy.get('[role="option"]').contains('Sistemas de Informação').click()

    // Only Blockchain proposal (department SI) visible
    cy.contains('Blockchain para Certificação Acadêmica').should('be.visible')
    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('not.exist')
    cy.contains('Proposta Finalizada de Teste').should('not.exist')
  })

  it('filters by area', () => {
    // Open area select
    cy.get('#area-select').click()
    // Select "Banco de Dados"
    cy.get('[role="option"]').contains('Banco de Dados').click()

    // Only Blockchain (area BD) visible
    cy.contains('Blockchain para Certificação Acadêmica').should('be.visible')
    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('not.exist')
  })

  it('shows empty state when no proposals match', () => {
    // Search for nonexistent term
    cy.get('input[placeholder="Buscar por título..."]').type('xyznonexistent9876')

    // Empty state visible
    cy.contains('Nenhuma proposta encontrada.').should('be.visible')
  })

  it('does not show pagination when total <= per page', () => {
    // Our seed has 3 proposals, per_page is 15 — pagination should not render
    cy.contains('Anterior').should('not.exist')
    cy.contains('Próximo').should('not.exist')
    cy.contains('Página').should('not.exist')
  })

  it('navigates from landing page to proposals detail', () => {
    cy.visit('/')

    // Home page should have a link or section pointing to proposals
    // After lazy load, click a featured proposal or navigate to mural
    // Click "Mural" in the site header to navigate to proposals
    cy.contains('a', 'Mural').click()

    // Now on proposals page
    cy.location('pathname').should('eq', '/propostas')

    // Click on first proposal card
    cy.contains('Redes Neurais para Reconhecimento de Imagens').click()

    // Should navigate to detail page
    cy.location('pathname').should('match', /\/propostas\/\d+/)
  })
})
