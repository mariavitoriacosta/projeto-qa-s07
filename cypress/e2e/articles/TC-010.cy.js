import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-010 - Filtro de artigos por tag existente', () => {
  it('deve exibir artigos associados à tag selecionada', () => {
    const uniqueId = Date.now()

    const username = `user_tc010_${uniqueId}`
    const email = `tc010_${uniqueId}@teste.com`
    const password = 'Senha123!'

    const articleTitle = `Artigo TC010 ${uniqueId}`
    const tagName = `tag-tc010-${uniqueId}`

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
      'Artigo criado para execução do TC-010',
      'Conteúdo do artigo utilizado no teste TC-010.',
      tagName
    )

    article.publishArticle()

    cy.contains('h1', articleTitle)
      .should('be.visible')

    cy.visit('/#/')

    cy.contains('Popular Tags')
      .should('be.visible')

    cy.contains('button.tag-pill', tagName)
      .should('be.visible')
      .click()

    cy.contains(articleTitle)
      .should('be.visible')

    cy.contains(tagName)
      .should('be.visible')
  })
})