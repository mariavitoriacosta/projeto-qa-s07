import login from '../login/index';
import home from '../home/index'
import register from './index';
import { faker } from '@faker-js/faker';

describe('Register Feature', () => {

    beforeEach(() => {
        home.accessHomePage();
        home.accessLoginPage();
        login.validateLoginPage();
        
    })

    it('Sistema não deve permitir criação de contas para usuário já cadastrado', () => {
        // seria interessante também garantir que já exista um usuário cadastrado

        login.acessarPaginaRegistro().then(() => {
            cy.url().should('include', '/register');
       });

       cy.intercept('POST', '/api/users').as('postUser');

       register.fillRegisterForm(Cypress.env('nameDefault'),Cypress.env('emailDefault'),Cypress.env('passwordDefault'));
       
       register.submitRegisterForm().then(() => {
            cy.wait('@postUser').then(({response}) => {
                expect(response.statusCode).to.eq(422)
            });
       });
    });

    Cypress._.times(3, () => {
        it('Criar conta para usuário não existente', () => {
        
            login.acessarPaginaRegistro().then(() => {
                cy.url().should('include', '/register');
           });

           cy.intercept('POST', '/api/users').as('postUser');

           register.fillRegisterForm(faker.person.fullName(), faker.internet.email(), faker.internet.password());
           register.submitRegisterForm().then(() => {
                cy.wait('@postUser').then(({response}) => {
                    expect(response.statusCode).to.eq(201);
                });
           });
        });
    });


});

