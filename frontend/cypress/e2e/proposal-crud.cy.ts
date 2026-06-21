describe('Proposal CRUD', () => {
  it('1. formulário de criação renderiza todos os campos', () => {
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

  it('2. cria proposta com dados válidos', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')

    cy.get('input[name="title"]').type('Nova Proposta de Teste E2E')
    cy.get('textarea[name="description"]').type('Descrição de teste para validar criação via Cypress.')
    cy.get('textarea[name="prerequisites"]').type('Nenhum pré-requisito específico')
    cy.get('input[name="max_slots"]').clear().type('3')

    cy.get('[aria-label="Departamento"]').click()
    cy.get('[role="option"]').first().click()

    cy.get('[aria-label="Área"]').click()
    cy.get('[role="option"]').first().click()

    cy.contains('button', 'Criar proposta').click()

    cy.url().should('match', /\/propostas\/\d+$/)
    cy.contains('Nova Proposta de Teste E2E').should('be.visible')

    cy.visit('/propostas')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Nova Proposta de Teste E2E').should('be.visible')
  })

  it('3. exibe erros de validação ao enviar formulário vazio', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Criar proposta').click()

    cy.url().should('include', '/propostas/nova')
    cy.get('form').contains(/obrigatóri|required|campo/i).should('be.visible')
  })

  it('4. aluno não consegue acessar a página de criação', () => {
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/nova')
    cy.contains('Carregando...').should('not.exist')

    cy.url().should('not.include', '/propostas/nova')
  })

  it('5. edição carrega dados existentes da proposta', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Editar proposta').should('be.visible')
    cy.get('input[name="title"]').should('have.value', 'Redes Neurais para Reconhecimento de Imagens')
  })

  it('6. edita e salva alterações', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.contains('Carregando...').should('not.exist')

    cy.get('input[name="title"]').clear().type('Redes Neurais - Título Atualizado')
    cy.contains('button', 'Salvar alterações').click()

    cy.url().should('include', '/dashboard')
    cy.contains('Redes Neurais - Título Atualizado').should('be.visible')
  })

  it('7. exclui proposta', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/2/editar')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Excluir proposta').click()
    cy.contains('Esta ação não pode ser desfeita').should('be.visible')
    cy.contains('button', 'Confirmar exclusão').click()

    cy.url().should('include', '/dashboard')

    cy.visit('/propostas')
    cy.contains('Carregando...').should('not.exist')
    cy.contains('Blockchain para Certificação Acadêmica').should('not.exist')
  })

  it('8. não pode editar proposta de outro professor', () => {
    cy.loginByApi('professor2@test.com', 'password123')
    cy.visit('/propostas/1/editar')
    cy.contains('Carregando...').should('not.exist')

    cy.url().should('not.include', '/propostas/1/editar')
  })
})