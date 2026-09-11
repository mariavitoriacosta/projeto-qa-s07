/// <reference types="Cypress" />
import home from '../home/index';
import login from './index';
import register from '../signUp/index';
const element = require('./elements').ELEMENTS;

describe('Login Feature usando Page Objects', () => {

    before(() => {
        register.generateFixtureUsers(5)
    })

    beforeEach(() => {
        home.accessHomePage();
    })

    it('Fazer login usando credenciais inválidas', () => {  
        home.accessLoginPage();
        login.validateLoginPage();

        cy.intercept('POST', 'api/users/login').as('postLogin');

        login.loginWithInvalidCredentials('carolina.louzada@test.com','123456');
            
        cy.wait('@postLogin').its('response.statusCode').should('eq',404);
        cy.contains(element.stringEmailNotFound);
    });

    it('Fazer login usando credenciais válidas ', () => {
        
        home.accessLoginPage();
        login.validateLoginPage();

        cy.intercept('POST', 'api/users/login').as('postLogin');
        cy.intercept('GET', 'api/user').as('getUser');

        login.loginWithValidCredentials(Cypress.env('emailDefault'), Cypress.env('passwordDefault'));
            
        cy.wait('@postLogin').its('response.statusCode').should('eq',200);

        cy.wait('@getUser').then(({response})=> {
            expect(response.statusCode).to.be.eq(200);
            expect(response.body).to.not.eq('undefined');
            expect(response.body.user).to.have.property('username');
            expect(response.body.user).to.have.property('email', 'email@email.com');
            expect(response.body.user).to.have.property('token').and.to.be.a('string');
            expect(response.body.user).to.have.property('image').and.to.be.a('null');
            expect(response.body.user).to.have.property('bio').and.to.be.a('null');
        })
    });

    it('Fazer login usando credenciais válidas para múltiplos usuários no mesmo teste', () => {
        
        cy.intercept('POST', 'api/users/login').as('postLogin');
        cy.intercept('GET', 'api/user').as('getUser');

        cy.fixture('usersCredentials.json').then((userFixture) => {
            userFixture.forEach(user => {
                home.accessLoginPage();
                login.validateLoginPage();
               
                login.loginWithValidCredentials(user.user.email, user.user.password);
            
                cy.wait('@postLogin').its('response.statusCode').should('eq',200);
            
                cy.wait('@getUser').then(({response})=> {
                    expect(response.statusCode).to.be.eq(200);
                    expect(response.body).to.not.eq('undefined');
                    expect(response.body.user).to.have.property('username');
                    expect(response.body.user).to.have.property('email',user.user.email);
                    expect(response.body.user).to.have.property('token').and.to.be.a('string');
                    expect(response.body.user).to.have.property('image').and.to.be.a('null');
                    expect(response.body.user).to.have.property('bio').and.to.be.a('null');
                });

                login.toLogout();
            });
        });
    });

    

});