import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-009 - Excluir artigo próprio', () => {
  it('deve permitir excluir um artigo pertencente ao usuário', () => {
    const uniqueId = Date.now()

    const username = `user_tc009_${uniqueId}`
    const email = `tc009_${uniqueId}@teste.com`
    const password = 'Senha123!'

    const articleTitle = `Artigo TC009 ${uniqueId}`

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
      'Artigo criado para execução do TC-009',
      'Conteúdo do artigo utilizado no teste TC-009.'
    )

    article.publishArticle()

    cy.contains('h1', articleTitle)
      .should('be.visible')

    article.deleteArticle()

    cy.url()
      .should('include', '/#/')

    cy.contains(articleTitle)
      .should('not.exist')
  })
})