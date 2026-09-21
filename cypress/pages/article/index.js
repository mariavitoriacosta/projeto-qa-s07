class Article {
  fillArticleForm(title, description, body, tag = null) {
    cy.get('input[placeholder="Article Title"]')
      .type(title)

    cy.get('input[placeholder="What\'s this article about?"]')
      .type(description)

    cy.get('textarea[placeholder="Write your article (in markdown)"]')
      .type(body)

    if (tag) {
      cy.get('input[placeholder="Enter tags"]')
        .type(tag)
    }
  }

  publishArticle() {
    cy.contains('button', 'Publish Article')
      .click()

    cy.url()
      .should('include', '/article/')
  }

  deleteArticle() {
    cy.window().then((win) => {
      cy.stub(win, 'confirm')
        .withArgs('Want to delete the article?')
        .returns(true)
    })

    cy.contains('button', 'Delete Article')
      .should('be.visible')
      .click()
  }
}

export default new Article()