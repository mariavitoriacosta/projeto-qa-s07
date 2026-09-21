class Register {
  registerUser(username, email, password) {
    cy.visit('/#/register')

    cy.get('input[name="username"]')
      .type(username)

    cy.get('input[name="email"]')
      .type(email)

    cy.get('input[name="password"]')
      .type(password)

    cy.contains('button', 'Sign up')
      .click()
  }

  validateRegisterPage() {
    cy.url()
      .should('include', '/register')
  }
}

export default new Register()