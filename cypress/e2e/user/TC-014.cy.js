import login from '../../pages/login'

describe('TC-014 - Login com e-mail inexistente', () => {
  it('não deve autenticar login com e-mail não cadastrado', () => {
    const uniqueId = Date.now()

    const nonExistentEmail = `tc014_${uniqueId}@teste.com`

    // Tenta logar com um e-mail que nunca foi cadastrado no sistema
    login.loginUser(nonExistentEmail, '12345678')

    // O login não deve ser realizado
    cy.url()
      .should('include', '/login')

    // A mensagem de erro retornada pela API deve ser exibida
    cy.contains('.error-messages li', 'Email not found sign in first')
      .should('be.visible')
  })
})
