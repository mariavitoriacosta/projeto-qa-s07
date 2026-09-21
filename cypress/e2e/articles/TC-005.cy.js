import article from '../../pages/article'
import register from '../../pages/register'
import user from '../../pages/user'

describe('TC-005 - Favoritar um artigo', () => {
  it('deve incrementar o contador e destacar o botão de favorito', () => {
    const uniqueId = Date.now()
    const author = {
      username: `author_tc005_${uniqueId}`,
      email: `author_tc005_${uniqueId}@teste.com`,
      password: '12345678'
    }
    const reader = {
      username: `reader_tc005_${uniqueId}`,
      email: `reader_tc005_${uniqueId}@teste.com`,
      password: '12345678'
    }
    const articleTitle = `Artigo TC005 ${uniqueId}`

    register.registerUser(author.username, author.email, author.password)

    cy.visit('/#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-005',
      'Conteúdo utilizado no teste de favorito TC-005.'
    )

    article.publishArticle()

    cy.url().then((articleUrl) => {
      user.logout(author.username)

      register.registerUser(reader.username, reader.email, reader.password)

      cy.visit(articleUrl)

      cy.get('.article-page .btn-outline-primary')
        .first()
        .should('not.have.class', 'active')
        .find('.counter')
        .invoke('text')
        .then((counterText) => {
          const initialCount = Number(counterText.match(/\d+/)[0])

          cy.get('.article-page .btn-outline-primary')
            .first()
            .click()

          cy.get('.article-page .btn-outline-primary')
            .first()
            .should('have.class', 'active')
            .find('.counter')
            .should('contain.text', initialCount + 1)
        })
    })
  })
})
