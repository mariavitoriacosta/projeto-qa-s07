import register from '../../pages/register'

describe('TC-012 - Cadastro com senha vazia', () => {
  it('não deve permitir cadastro com o campo de senha vazio', () => {
    const uniqueId = Date.now()

    const username = `user_tc012_${uniqueId}`
    const email = `tc012_${uniqueId}@teste.com`

    cy.visit('/#/register')

    cy.get('input[name="username"]')
      .type(username)

    cy.get('input[name="email"]')
      .type(email)

    // Campo de senha é deixado vazio propositalmente
    cy.get('input[name="password"]')
      .should('have.value', '')

    cy.contains('button', 'Sign up')
      .click()

    // O navegador deve bloquear o envio do formulário
    // (campo obrigatório vazio)
    register.validateRegisterPage()

    cy.get('input[name="password"]')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false
      })

    // Nenhuma conta deve ter sido criada
    cy.contains('.nav-item.dropdown', username)
      .should('not.exist')
  })
})
