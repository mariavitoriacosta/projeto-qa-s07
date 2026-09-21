class User {
  login(email, password) {
    cy.visit('/#/login')

    cy.get('input[name="email"]')
      .type(email)

    cy.get('input[name="password"]')
      .type(password)

    cy.contains('button', 'Login')
      .click()

    cy.url()
      .should('not.include', '/login')
  }

  logout(username) {
    cy.contains(username)
      .click()

    cy.contains('a', 'Logout')
      .should('be.visible')
      .click()
  }

  followUser() {
    cy.get('button.action-btn')
      .contains(/Follow/)
      .should('be.visible')
      .click()
  }

  updateBio(bio) {
    cy.visit('/#/settings')

    cy.get('textarea')
      .should('be.visible')
      .clear()
      .type(bio)

    cy.contains('button', 'Update Settings')
      .should('be.visible')
      .click()
  }
}

export default new User()