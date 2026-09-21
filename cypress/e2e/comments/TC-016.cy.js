import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-016 - Comentário com campo vazio', () => {
  it('não deve publicar um comentário vazio', () => {
    const uniqueId = Date.now()

    const username = `user_tc016_${uniqueId}`
    const email = `tc016_${uniqueId}@teste.com`
    const password = '12345678'
    const articleTitle = `Artigo TC016 ${uniqueId}`

    // Cadastra um usuário exclusivo para o teste
    register.registerUser(
      username,
      email,
      password
    )

    // Confirma que o cadastro foi concluído
    cy.url()
      .should('not.include', '/register')

    // Acessa o editor
    cy.visit('/#/editor')

    // Preenche o artigo
    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-016',
      'Conteúdo do artigo utilizado no teste TC-016.'
    )

    // Publica o artigo
    article.publishArticle()

    // Confirma que o artigo criado está sendo exibido
    cy.contains('h1', articleTitle)
      .should('be.visible')

    // Confirma que o formulário de comentário está disponível
    cy.get('.comment-form')
      .should('be.visible')

    // Confirma que o campo está vazio
    cy.get('.comment-form textarea')
      .should('be.visible')
      .and('have.value', '')

    // Confirma que inicialmente não existem comentários
    cy.contains('There are no comments yet...')
      .should('be.visible')

    // Tenta publicar sem preencher o comentário
    cy.get('.comment-form')
      .contains('button', 'Post Comment')
      .click()

    // O campo deve continuar vazio
    cy.get('.comment-form textarea')
      .should('have.value', '')

    // Nenhum comentário deve ter sido criado
    cy.contains('There are no comments yet...')
      .should('be.visible')
  })
})