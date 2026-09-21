import register from '../../pages/register'
import login from '../../pages/login'
import user from '../../pages/user'

describe('TC-013 - Login com senha incorreta', () => {
  it('não deve autenticar login com senha incorreta', () => {
    const uniqueId = Date.now()

    const account = {
      username: `user_tc013_${uniqueId}`,
      email: `tc013_${uniqueId}@teste.com`,
      password: '12345678'
    }

    // Cadastra um usuário exclusivo para o teste
    register.registerUser(
      account.username,
      account.email,
      account.password
    )

    cy.url()
      .should('not.include', '/register')

    // Faz logout para tentar o login novamente
    user.logout(account.username)

    // Tenta logar com a senha errada
    login.loginUser(account.email, 'senhaErrada123')

    // O login não deve ser realizado
    cy.url()
      .should('include', '/login')

    // A mensagem de erro retornada pela API deve ser exibida
    cy.contains('.error-messages li', 'Wrong email/password combination')
      .should('be.visible')
  })
})
