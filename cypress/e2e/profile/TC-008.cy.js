import register from '../../pages/register'
import user from '../../pages/user'

describe('TC-008 - Editar bio no perfil', () => {
  it('deve permitir atualizar a bio do usuário', () => {
    const uniqueId = Date.now()

    const username = `user_tc008_${uniqueId}`
    const email = `tc008_${uniqueId}@teste.com`
    const password = 'Senha123!'

    const newBio = `Bio atualizada TC008 ${uniqueId}`

    register.registerUser(
      username,
      email,
      password
    )

    cy.url()
      .should('not.include', '/register')

    user.updateBio(newBio)

    cy.visit(`/#/profile/${username}`)

    cy.get('.user-info')
      .should('contain.text', newBio)
  })
})