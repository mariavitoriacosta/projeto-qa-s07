import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-006 - Comentar em artigo existente', () => {
  it('deve permitir publicar um comentário em um artigo', () => {
    const uniqueId = Date.now()

    const username = `user_tc006_${uniqueId}`
    const email = `tc006_${uniqueId}@teste.com`
    const password = 'Senha123!'

    const articleTitle = `Artigo TC006 ${uniqueId}`
    const comment = `Comentário TC006 ${uniqueId}`

    register.registerUser(
      username,
      email,
      password
    )

    cy.url()
      .should('not.include', '/register')

    cy.visit('/#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-006',
      'Conteúdo do artigo utilizado no teste TC-006.'
    )

    article.publishArticle()

    cy.contains('h1', articleTitle)
      .should('be.visible')

    article.commentArticle(comment)

    cy.get('.card .card-text')
      .should('contain.text', comment)
  })
})