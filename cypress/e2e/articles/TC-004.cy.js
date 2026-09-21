import article from '../../pages/article'
import register from '../../pages/register'

describe('TC-004 - Edição de artigo próprio', () => {
  it('deve salvar e exibir imediatamente o novo título do artigo', () => {
    const uniqueId = Date.now()
    const author = {
      username: `author_tc004_${uniqueId}`,
      email: `tc004_${uniqueId}@teste.com`,
      password: '12345678'
    }
    const articleTitle = `Artigo TC004 ${uniqueId}`
    const updatedTitle = `${articleTitle} atualizado`

    register.registerUser(author.username, author.email, author.password)

    cy.visit('/#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-004',
      'Conteúdo original utilizado no teste TC-004.'
    )

    article.publishArticle()

    cy.contains('a', 'Edit Article')
      .should('be.visible')
      .click()

    cy.get('input[placeholder="Article Title"]')
      .clear()
      .type(updatedTitle)

    cy.contains('button', 'Update Article')
      .click()

    cy.contains('h1', updatedTitle)
      .should('be.visible')
  })
})
