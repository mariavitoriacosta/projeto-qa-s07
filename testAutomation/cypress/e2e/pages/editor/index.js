import { faker } from '@faker-js/faker';
const element = require('./elements').ELEMENTS;

class editor {

    fillArticleForm(title, description, text,tag){

        cy.get(element.inputTitleArticle).type(title).as('titleArticle');
        cy.get(element.inputDescriptionArticle).type(description);
        cy.get(element.inputTextArticle).type(text);
        cy.get(element.inputTagArticle).type(tag);

    }

    publishArticle(){
      
        return cy.get(element.btnPublish)
                    .should('be.visible')
                    .and('have.attr', 'type', 'submit')
                    .click();
    }

}

export default new editor();