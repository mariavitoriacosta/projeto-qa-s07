class User {
  logout(username) {
    cy.contains(username)
      .click()

    cy.contains('a', 'Logout')
      .should('be.visible')
      .click()
  }
}

export default new User()