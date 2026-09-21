import register from '../../pages/register'

describe('TC-015 - Criação de artigo sem título', () => {
  it('não deve publicar um artigo com o campo de título vazio', () => {
    const uniqueId = Date.now()

    const username = `user_tc015_${uniqueId}`
    const email = `tc015_${uniqueId}@teste.com`
    const password = '12345678'

    // Cadastra um usuário exclusivo para o teste
    register.registerUser(
      username,
      email,
      password
    )

    cy.url()
      .should('not.include', '/register')

    // Acessa o editor
    cy.visit('/#/editor')

    // Preenche a descrição e o corpo, deixando o título vazio propositalmente
    cy.get('input[placeholder="What\'s this article about?"]')
      .type('Artigo criado para execução do TC-015')

    cy.get('textarea[placeholder="Write your article (in markdown)"]')
      .type('Conteúdo do artigo utilizado no teste TC-015.')

    cy.get('input[placeholder="Article Title"]')
      .should('have.value', '')

    cy.contains('button', 'Publish Article')
      .click()

    // O navegador deve bloquear a publicação
    // (campo obrigatório vazio)
    cy.url()
      .should('include', '/editor')

    cy.get('input[placeholder="Article Title"]')
      .then(($input) => {
        expect($input[0].checkValidity()).to.be.false
      })
  })
})
