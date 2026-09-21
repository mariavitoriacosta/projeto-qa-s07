import register from '../../pages/register'

describe('TC-001 - Cadastro de usuário com dados válidos', () => {
  it('deve criar a conta, autenticar o usuário e redirecionar para o feed', () => {
    const uniqueId = Date.now()
    const user = {
      username: `user_tc001_${uniqueId}`,
      email: `tc001_${uniqueId}@teste.com`,
      password: '12345678'
    }

    cy.request({
      url: '/api/tags',
      retryOnNetworkFailure: true,
      retryOnStatusCodeFailure: true
    })
      .its('status')
      .should('eq', 200)

    register.registerUser(user.username, user.email, user.password)

    cy.url()
      .should('not.include', '/register')

    cy.contains('.nav-item.dropdown', user.username)
      .should('be.visible')

    cy.contains('a', 'New Article')
      .should('be.visible')
  })
})
