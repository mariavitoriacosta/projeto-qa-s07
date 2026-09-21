import article from '../../pages/article'
import register from '../../pages/register'

describe('TC-003 - Criação de artigo com dados válidos', () => {
  it('deve publicar o artigo e exibi-lo na página do artigo e no perfil do autor', () => {
    const uniqueId = Date.now()
    const author = {
      username: `author_tc003_${uniqueId}`,
      email: `tc003_${uniqueId}@teste.com`,
      password: '12345678'
    }
    const articleTitle = `Artigo TC003 ${uniqueId}`

    register.registerUser(author.username, author.email, author.password)

    cy.contains('a', 'New Article')
      .should('be.visible')
      .click()

    cy.location('hash')
      .should('eq', '#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-003',
      'Conteúdo do artigo utilizado no teste TC-003.',
      'cypress'
    )

    article.publishArticle()

    cy.contains('h1', articleTitle)
      .should('be.visible')

    cy.visit(`/#/profile/${author.username}`)

    cy.contains('.article-preview h1', articleTitle)
      .should('be.visible')
  })
})
