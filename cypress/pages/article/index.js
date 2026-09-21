class Article {
  fillArticleForm(title, description, body, tag = null) {
    cy.get('input[placeholder="Article Title"]')
      .should('be.visible')

    cy.get('input[placeholder="Article Title"]')
      .type(title)

    cy.get('input[placeholder="What\'s this article about?"]')
      .should('be.visible')

    cy.get('input[placeholder="What\'s this article about?"]')
      .type(description)

    cy.get('textarea[placeholder="Write your article (in markdown)"]')
      .should('be.visible')

    cy.get('textarea[placeholder="Write your article (in markdown)"]')
      .type(body)

    if (tag) {
      cy.get('input[placeholder="Enter tags"]')
        .should('be.visible')
        .type(tag)
    }
  }

  publishArticle() {
    cy.contains('button', 'Publish Article')
      .should('be.visible')
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

  commentArticle(comment) {
    cy.get('textarea[placeholder="Write a comment..."]')
      .should('be.visible')
      .type(comment)

    cy.contains('button', 'Post Comment')
      .should('be.visible')
      .click()
  }
}

export default new Article()