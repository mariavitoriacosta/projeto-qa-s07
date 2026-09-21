import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-018 - Exclusão de artigo já removido', () => {
  it('deve tratar a tentativa de acessar novamente um artigo já excluído', () => {
    const uniqueId = Date.now()

    const user = {
      username: `user_tc018_${uniqueId}`,
      email: `tc018_${uniqueId}@teste.com`,
      password: '12345678'
    }

    const articleTitle = `Artigo TC018 ${uniqueId}`

    // Cadastra um usuário exclusivo para o teste
    register.registerUser(
      user.username,
      user.email,
      user.password
    )

    cy.url()
      .should('not.include', '/register')

    // Acessa o editor
    cy.visit('/#/editor')

    // Preenche o formulário do artigo
    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-018',
      'Conteúdo do artigo utilizado no teste TC-018.'
    )

    // Publica o artigo
    article.publishArticle()

    // Confirma que o artigo foi criado
    cy.contains('h1', articleTitle)
      .should('be.visible')

    // Guarda a URL antes de excluir o artigo
    cy.url().then((articleUrl) => {

      // Exclui o artigo pela interface
      article.deleteArticle()

      // Tenta acessar novamente o artigo que já foi removido
      cy.visit(articleUrl)

      // O artigo excluído não deve mais ser exibido
      cy.contains('h1', articleTitle)
        .should('not.exist')

      // A opção de excluir também não deve mais estar disponível
      cy.contains('button', 'Delete Article')
        .should('not.exist')
    })
  })
})