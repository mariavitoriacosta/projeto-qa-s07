class Login {
  loginUser(email, password) {
    cy.visit('/#/login')

    cy.get('input[name="email"]')
      .type(email)

    cy.get('input[name="password"]')
      .type(password)

    cy.contains('button', 'Login')
      .click()
  }
}

export default new Login()
