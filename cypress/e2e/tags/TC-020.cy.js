import register from '../../pages/register'
import article from '../../pages/article'

describe('TC-020 - Busca por tag inexistente', () => {
  it('deve exibir lista vazia ao selecionar uma tag sem artigos associados', () => {
    const uniqueId = Date.now()

    const user = {
      username: `user_tc020_${uniqueId}`,
      email: `tc020_${uniqueId}@teste.com`,
      password: '12345678'
    }

    const articleTitle = `Artigo TC020 ${uniqueId}`
    const tagName = `tag-tc020-${uniqueId}`

    // Cadastra um usuário exclusivo para o teste
    register.registerUser(
      user.username,
      user.email,
      user.password
    )

    // Confirma que o cadastro foi concluído
    cy.url()
      .should('not.include', '/register')

    // Acessa o editor
    cy.visit('/#/editor')

    // Preenche o artigo com uma tag exclusiva
    article.fillArticleForm(
      articleTitle,
      'Artigo criado para execução do TC-020',
      'Conteúdo do artigo utilizado no teste TC-020.',
      tagName
    )

    // Publica o artigo
    article.publishArticle()

    // Confirma que o artigo foi criado
    cy.contains('h1', articleTitle)
      .should('be.visible')

    // Exclui o artigo, deixando a tag sem artigos associados
    article.deleteArticle()

    // Volta para a página inicial
    cy.visit('/#/')

    // Confirma que a área de tags está disponível
    cy.contains('Popular Tags')
      .should('be.visible')

    // Seleciona a tag que ficou sem artigos associados
    cy.contains('button.tag-pill', tagName)
      .should('be.visible')
      .click()

    // Confirma que a tag selecionada está sendo exibida
    cy.contains(tagName)
      .should('be.visible')

    // Nenhum artigo deve estar disponível para essa tag
    cy.contains('Articles not available.')
      .should('be.visible')

    // A aplicação deve continuar funcionando normalmente
    cy.get('body')
      .should('be.visible')
  })
})