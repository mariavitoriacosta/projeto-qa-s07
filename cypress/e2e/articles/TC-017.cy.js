import register from '../../pages/register'
import article from '../../pages/article'
import user from '../../pages/user'

describe('TC-017 - Tentativa de editar artigo de outro autor', () => {
  it('não deve permitir editar artigo pertencente a outro usuário', () => {
    const uniqueId = Date.now()

    const author = {
      username: `author_tc017_${uniqueId}`,
      email: `author_tc017_${uniqueId}@teste.com`,
      password: '12345678'
    }

    const otherUser = {
      username: `user_tc017_${uniqueId}`,
      email: `user_tc017_${uniqueId}@teste.com`,
      password: '12345678'
    }

    const articleTitle = `Artigo TC017 ${uniqueId}`

    // Cadastra o autor do artigo
    register.registerUser(
      author.username,
      author.email,
      author.password
    )

    cy.url()
      .should('not.include', '/register')

    // Cria o artigo do primeiro usuário
    cy.visit('/#/editor')

    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-017',
      'Conteúdo do artigo utilizado no teste TC-017.'
    )

    article.publishArticle()

    cy.contains('h1', articleTitle)
      .should('be.visible')

    // Guarda a URL do artigo criado
    cy.url().then((articleUrl) => {

      // Sai da conta do autor
      user.logout(author.username)

      // Cadastra um segundo usuário
      register.registerUser(
        otherUser.username,
        otherUser.email,
        otherUser.password
      )

      cy.url()
        .should('not.include', '/register')

      // Segundo usuário acessa o artigo do primeiro
      cy.visit(articleUrl)

      cy.contains('h1', articleTitle)
        .should('be.visible')

      // Não deve existir opção de edição pela interface
      cy.contains('a', 'Edit Article')
        .should('not.exist')

      // Tenta acessar diretamente a rota de edição
      const slug = articleUrl.split('/article/')[1]

      cy.visit(`/#/editor/${slug}`)

      // O formulário de edição não deve ser disponibilizado
      cy.get('input[placeholder="Article Title"]')
        .should('not.exist')
    })
  })
})