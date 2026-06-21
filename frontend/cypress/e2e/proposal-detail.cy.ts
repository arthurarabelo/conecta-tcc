describe('Proposal Detail Page', () => {
  it('1. carrega a página de detalhe corretamente', () => {
    cy.visit('/propostas/1')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Redes Neurais para Reconhecimento de Imagens').should('be.visible')
    cy.contains('Sobre o projeto').should('be.visible')
    cy.contains('professor@test.com'.split('@')[0], { matchCase: false }).should('not.exist') // sanity: não deve vazar email
    cy.get('main').within(() => {
      cy.get('[class*="badge"], span').should('exist')
    })
  })

  it('2. exibe página de não encontrado para proposta inexistente', () => {
    cy.visit('/propostas/99999')
    cy.contains('Carregando...').should('not.exist')
    cy.contains(/não encontrada/i).should('be.visible')
  })

  it('3. aluno consegue se candidatar à proposta', () => {
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/2')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Candidatar-se').click()
    cy.contains(/candidatura enviada/i).should('be.visible')
    cy.contains('Em análise').should('be.visible')
  })

  it('4. não permite se candidatar duas vezes', () => {
    cy.loginByApi('student@test.com', 'password123')
    // Proposal 1 já tem application pending do seed (ver E2ETestSeeder)
    cy.visit('/propostas/1')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Em análise').should('be.visible')
    cy.contains('button', 'Candidatar-se').should('not.exist')
  })

  it('5. proposta fechada não pode ser candidatada', () => {
    cy.loginByApi('student@test.com', 'password123')
    cy.visit('/propostas/3') // status: closed no seed
    cy.contains('Carregando...').should('not.exist')

    cy.contains('button', 'Proposta encerrada').should('be.visible').and('be.disabled')
  })

  it('6. usuário não autenticado vê prompt de login', () => {
    cy.visit('/propostas/1')
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Entrar para se candidatar').should('be.visible')
  })

  it('7. professor vê botão de editar na própria proposta', () => {
    cy.loginByApi('professor@test.com', 'password123')
    cy.visit('/propostas/1') // criada por professor@test.com no seed
    cy.contains('Carregando...').should('not.exist')

    cy.contains('a, button', 'Editar').should('be.visible')
  })

  it('8. professor NÃO vê editar em proposta de outro professor', () => {
    cy.loginByApi('professor2@test.com', 'password123')
    cy.visit('/propostas/1') // pertence a professor@test.com, não a professor2
    cy.contains('Carregando...').should('not.exist')

    cy.contains('Editar').should('not.exist')
  })
})