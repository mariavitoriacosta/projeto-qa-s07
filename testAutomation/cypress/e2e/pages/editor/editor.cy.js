/// <reference types="Cypress" />
import login from '../login/index';
import home from '../home/index'
import editor from '../editor/index'
import { faker } from '@faker-js/faker';

describe('Gerenciar artigo - versão com Page Objects', () => {

    beforeEach(() => {
        home.accessHomePage('/');
        home.accessLoginPage();
        login.validateLoginPage();
        login.loginWithValidCredentials('carol@teste.com','123456');
        
    });

    it('Criar artigo com sucesso usando tag', () => {
        const title = faker.lorem.sentence(3);
        const description = faker.lorem.sentence(2);
        const text = faker.lorem.paragraph();
        const tag = faker.lorem.word();

        cy.intercept('POST', '/api/articles').as('postArticle');

        home.acessNewArticlePage();
        editor.fillArticleForm(title,description,text,tag);
        editor.publishArticle().then(() => {

            cy.wait('@postArticle').then(({response}) => {
                expect(response.statusCode).to.equal(201);
            });
            cy.get('@titleArticle').then(() => {
                cy.url().should('include','/article/')
                cy.contains(title)
                cy.contains(tag);
            })
            
        });
    });
});

describe('Gerenciar artigo - versão com uso de custom commands e login UI', () => {

    beforeEach(() => {

        cy.visit('#/login');
        cy.loginUI('carol@teste.com','123456');
        
    });

    it('Criar artigo com sucesso usando tag', () => {
        const title = faker.lorem.sentence(3);
        const description = faker.lorem.sentence();
        const text = faker.lorem.paragraph(2);
        const tag = faker.lorem.word();

        cy.contains('New Article')
        .should('have.attr','href','#/editor')
        .click();

        cy.fillArticle(title, description, text, tag);

        cy.intercept('POST', '/api/articles').as('postArticle');
        cy.intercept('GET', '/api/articles/**').as('getArticles');

        cy.publishArticle().then(() => {
                cy.wait('@postArticle').then(({response}) => {
                    expect(response.statusCode).to.equal(201);
                });
                cy.wait('@getArticles').its('response.statusCode').should('eq', 200);
                cy.url().should('include','/article/')
                cy.contains(title)
                cy.contains(tag);   
                });

    });
});

describe('Gerenciar artigo - versão com uso de custom commands e login via API', () => {

    beforeEach(() => {

        cy.loginAPI('carol@teste.com','123456').as('session');
        cy.visit('#/editor');
        
    });

    it('Criar artigo com sucesso usando tag ', () => {

        const title = faker.lorem.sentence(3);
        const description = faker.lorem.sentence(2);
        const text = faker.lorem.paragraph();
        const tag = faker.lorem.word(4);

        cy.contains('New Article', )
        .should('have.attr','href','#/editor')
        .click();

        cy.fillArticle(title, description, text, tag);

        cy.intercept('POST', '/api/articles').as('postArticle');
        cy.intercept('GET', '/api/articles/**').as('getArticles');

        cy.publishArticle().then(() => {
                cy.wait('@postArticle').then(({response}) => {
                    expect(response.statusCode).to.equal(201);
                });
                cy.wait('@getArticles').its('response.statusCode').should('eq', 200);
                cy.url().should('include','/article/')
                cy.contains(title)
                cy.contains(tag);   
                });
    });

    it('Excluir artigo postado pelo usuário', () => {
        
        let loggedUser = JSON.parse(window.localStorage.getItem('loggedUser'));
        cy.createRandomArticle().then((article) => {
            cy.postArticleAPI(article,loggedUser);
        });
      
        cy.accessProfile();

        cy.accessRecentArticle();
        
        cy.intercept('DELETE', '/api/articles/**').as('deleteArticle');

        cy.contains(' Delete Article').click().then(() => {
            cy.wait('@deleteArticle').its('response.statusCode').should('eq',200);
        })
    });

});