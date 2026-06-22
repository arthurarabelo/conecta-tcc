describe('Proposal CRUD', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/proposals*').as('getProposals')
    cy.intercept('GET', '**/api/proposals/*').as('getProposal')
    cy.intercept('POST', '**/api/proposals').as('createProposal')
    cy.intercept('PATCH', '**/api/proposals/*').as('updateProposal')
    cy.intercept('DELETE', '**/api/proposals/*').as('deleteProposal')
  })

  it('renders create form with all fields', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Nova proposta').should('be.visible')

    cy.get('input[name="title"]').should('be.visible')
    cy.get('textarea[name="description"]').should('be.visible')
    cy.get('textarea[name="prerequisites"]').should('be.visible')
    cy.get('input[name="max_slots"]').should('be.visible')
    cy.get('[aria-label="Departamento"]').should('be.visible')
    cy.get('[aria-label="Área"]').should('be.visible')
  })

  it('creates a proposal and verifies it appears on the proposals list', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Nova proposta').should('be.visible')

    // Fill form fields
    cy.get('input[name="title"]').type('Proposta Cypress - Validação de Criação')
    cy.get('textarea[name="description"]').type(
      'Descrição detalhada da proposta criada pelo teste e2e para validar o fluxo completo.',
    )
    cy.get('textarea[name="prerequisites"]').type('Conhecimentos básicos em programação')
    cy.get('input[name="max_slots"]').clear().type('2')

    // Select department via Radix Select
    cy.get('[aria-label="Departamento"]').click()
    cy.get('[role="option"]').contains('Ciência da Computação').click()

    // Select area via Radix Select — body might still have pointer-events lock
    cy.get('body').then(($body) => {
      $body.removeAttr('data-scroll-locked')
      $body.css('pointer-events', 'auto')
    })
    cy.get('[aria-label="Área"]').click()
    cy.get('[role="option"]').contains('Inteligência Artificial').click()

    // Submit
    cy.contains('button', 'Criar proposta').click()
    cy.wait('@createProposal')

    // Should navigate to the new proposal detail page
    cy.url().should('match', /\/propostas\/\d+/)
    cy.contains('Proposta Cypress - Validação de Criação').should('be.visible')

    // Verify it appears on the proposals list too
    cy.visit('/propostas')
    cy.wait('@getProposals')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Proposta Cypress - Validação de Criação').should('be.visible')
  })

  it('shows validation errors on empty form submission', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Criar proposta').click()

    // Should stay on create page
    cy.url().should('include', '/propostas/nova')
    // Zod validation messages use "deve" or "Selecione"
    cy.contains(/deve|Selecione/i).should('be.visible')
  })

  it('student cannot access create page', () => {
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')

    cy.url().should('not.include', '/propostas/nova')
  })

  it('edit page loads existing proposal data', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.wait('@getProposal')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Editar proposta').should('be.visible')
    cy.get('input[name="title"]').should('have.value', 'Redes Neurais para Reconhecimento de Imagens')
  })

  it('edits and saves changes', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.wait('@getProposal')
    cy.contains('Carregando...').should('not.exist')

    cy.get('input[name="title"]').clear().type('Redes Neurais - Título Atualizado')
    cy.contains('button', 'Salvar alterações').click()
    cy.wait('@updateProposal')

    // After save, navigates to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Redes Neurais - Título Atualizado').should('be.visible')
  })

  it('deletes a proposal', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/2/editar')
    cy.wait('@getProposal')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Excluir proposta').click()
    cy.contains('Esta ação não pode ser desfeita').should('be.visible')
    cy.contains('button', 'Confirmar exclusão').click()
    cy.wait('@deleteProposal')

    cy.url().should('include', '/dashboard')
  })

  it('cannot edit another professors proposal', () => {
    cy.loginByApi('professor2@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.wait('@getProposal')
    cy.contains('Carregando...').should('not.exist')

    // Should be redirected away (not on edit page)
    cy.url().should('not.include', '/propostas/1/editar')
  })
})
