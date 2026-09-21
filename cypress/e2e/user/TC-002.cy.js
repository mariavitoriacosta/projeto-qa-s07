import login from '../../pages/login'
import register from '../../pages/register'
import user from '../../pages/user'

describe('TC-002 - Login com credenciais válidas', () => {
  it('deve autenticar usuário já cadastrado e redirecionar para o feed', () => {
    const uniqueId = Date.now()
    const account = {
      username: `user_tc002_${uniqueId}`,
      email: `tc002_${uniqueId}@teste.com`,
      password: '12345678'
    }

    // Pré-condição: cria uma conta exclusiva para este cenário.
    register.registerUser(account.username, account.email, account.password)

    cy.url()
      .should('not.include', '/register')

    user.logout(account.username)

    login.loginUser(account.email, account.password)

    cy.url()
      .should('not.include', '/login')

    cy.contains('.nav-item.dropdown', account.username)
      .should('be.visible')
  })
})
