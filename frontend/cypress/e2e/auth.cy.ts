describe('Authentication', () => {
  context('Login', () => {
    it('logs in with valid credentials', () => {
      cy.visit('/entrar')

      // Fill the login form
      cy.get('input[type="email"]').type('student@test.com')
      cy.get('input[type="password"]').type('password123')
      cy.contains('button', 'Entrar').click()

      // After successful login, redirect to home
      cy.location('pathname').should('eq', '/')

      // Header should show the user name
      cy.contains('Estudante Teste').should('be.visible')

      // Auth token should be stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('auth_token')
        expect(token).to.exist
      })
    })

    it('shows error on invalid credentials', () => {
      cy.visit('/entrar')

      cy.get('input[type="email"]').type('student@test.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.contains('button', 'Entrar').click()

      // Should show error alert
      cy.contains('Credenciais invalidas').should('be.visible')

      // Should stay on login page
      cy.location('pathname').should('eq', '/entrar')
    })
  })

  context('Register', () => {
    it('registers a new student account', () => {
      cy.visit('/entrar')

      // Switch to register mode
      cy.contains('button', 'Cadastre-se').click()

      // Header should now show register context
      cy.contains('h1', 'Crie sua conta').should('be.visible')

      // Fill the register form
      cy.get('input[placeholder="Seu nome completo"]').type('Novo Aluno')
      cy.get('input[type="email"]').type('novo.aluno@test.com')
      cy.get('input[type="password"]').eq(0).type('password123')
      cy.get('input[type="password"]').eq(1).type('password123')

      // Select department (fetched from API, default is disabled placeholder "0")
      cy.get('select').select('1')

      // Ensure role is "Aluno" (it's the default)
      cy.get('button[aria-label="Aluno"]').click()

      // Submit
      cy.contains('button', 'Criar conta').click()

      // After successful registration, redirect to home
      cy.location('pathname').should('eq', '/')

      // Header should show the new user name
      cy.contains('Novo Aluno').should('be.visible')
    })
  })

  context('Logout', () => {
    it('logs out and clears auth state', () => {
      // Login via API for speed (we already tested login UI above)
      cy.loginByApi('student@test.com', 'password123')

      // Reload so the app picks up the seeded auth state
      cy.visit('/')

      // Header should show authenticated state
      cy.contains('Estudante Teste').should('be.visible')

      // Open user menu
      cy.contains('Estudante Teste').click()

      // Click logout
      cy.contains('Sair').click()

      // Should redirect to home
      cy.location('pathname').should('eq', '/')

      // Auth token should be removed
      cy.window().then((win) => {
        const token = win.localStorage.getItem('auth_token')
        expect(token).to.be.null
      })

      // Header should show logged-out state
      cy.contains('Entrar').should('be.visible')
    })
  })
})
