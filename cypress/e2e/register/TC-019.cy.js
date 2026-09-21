import register from '../../pages/register'
import user from '../../pages/user'

describe('TC-019 - Cadastro com nome de usuário já existente', () => {
  it('não deve permitir cadastro com username já cadastrado', () => {
    const uniqueId = Date.now()

    const username = `user_tc019_${uniqueId}`
    const password = '12345678'

    const firstEmail = `tc019_first_${uniqueId}@teste.com`
    const secondEmail = `tc019_second_${uniqueId}@teste.com`

    // Realiza o primeiro cadastro
    register.registerUser(
      username,
      firstEmail,
      password
    )

    // Confirma que o primeiro cadastro foi concluído
    cy.url()
      .should('not.include', '/register')

    // Faz logout do primeiro usuário
    user.logout(username)

    // Tenta realizar um novo cadastro com o mesmo username
    register.registerUser(
      username,
      secondEmail,
      password
    )

    // O cadastro deve ser rejeitado e permanecer
    // na página de registro
    register.validateRegisterPage()

    // Os dados informados devem continuar no formulário
    cy.get('input[name="username"]')
      .should('have.value', username)

    cy.get('input[name="email"]')
      .should('have.value', secondEmail)
  })
})