import register from '../../pages/register'
import article from '../../pages/article'
import user from '../../pages/user'

describe('TC-007 - Seguir outro usuário', () => {
  it('deve permitir seguir outro usuário', () => {
    const uniqueId = Date.now()

    const author = {
      username: `author_tc007_${uniqueId}`,
      email: `author_tc007_${uniqueId}@teste.com`,
      password: 'Senha123!'
    }

    const follower = {
      username: `follower_tc007_${uniqueId}`,
      email: `follower_tc007_${uniqueId}@teste.com`,
      password: 'Senha123!'
    }

    const articleTitle = `Artigo TC007 ${uniqueId}`

    register.registerUser(
      author.username,
      author.email,
      author.password
    )

    cy.url()
      .should('not.include', '/register')

    cy.visit('/#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-007',
      'Conteúdo do artigo utilizado no teste TC-007.'
    )

    article.publishArticle()

    user.logout(author.username)

    register.registerUser(
      follower.username,
      follower.email,
      follower.password
    )

    cy.url()
      .should('not.include', '/register')

    cy.visit(`/#/profile/${author.username}`)

    cy.contains(author.username)
      .should('be.visible')

    user.followUser()

    cy.get('button.action-btn')
      .should('contain.text', 'Unfollow')
  })
})