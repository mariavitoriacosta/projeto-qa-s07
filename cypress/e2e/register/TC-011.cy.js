import register from '../../pages/register'

describe('TC-011 - Cadastro com e-mail em formato inválido', () => {
  it('não deve permitir cadastro com e-mail em formato inválido', () => {
    const uniqueId = Date.now()

    const username = `user_tc011_${uniqueId}`
    const invalidEmail = 'usuarioemail.com'
    const password = '12345678'

    // Tenta cadastrar utilizando um e-mail sem o caractere '@'
    register.registerUser(
      username,
      invalidEmail,
      password
    )

    // O navegador deve bloquear o envio do formulário
    // (validação nativa do campo type="email")
    register.validateRegisterPage()

    cy.get('input[name="email"]')
      .should('have.value', invalidEmail)
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false
      })

    // Nenhuma conta deve ter sido criada
    cy.contains('.nav-item.dropdown', username)
      .should('not.exist')
  })
})
