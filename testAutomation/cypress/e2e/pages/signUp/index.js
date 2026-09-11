const element = require('./elements').ELEMENTS;
import { faker } from '@faker-js/faker';

class register{

    generateFixtureUsers(quantity) {
        const arrayCredentials = [];
        const arrayResponses = [];
        test : Cypress._.times(quantity, () => {
          cy.request({
                method: 'POST',
                url: '/api/users',
                body: {
                    user:{
                        username: faker.internet.userName(),
                        email:  faker.internet.email(),
                        password: faker.internet.password()
                    }
                }
            }).then((response) => {
                arrayCredentials.push(JSON.parse(response.requestBody));
                arrayResponses.push(response.body);
            });
        });
        cy.writeFile('cypress/fixtures/usersCredentials.json', arrayCredentials);
        cy.writeFile('cypress/fixtures/usersRegistered.json', arrayResponses);
    }

    fillRegisterForm(name, email, password){
        cy.get(element.nameInput)
            .type(name)
            .should('have.attr', 'required');

        cy.get(element.emailInput)
            .type(email)
            .should('have.attr', 'type', 'email')
            .and('have.attr', 'required');

        cy.get(element.passwordInput)
            .type(password)
            .should('have.attr', 'type', 'password')
            .and('have.attr', 'required');
            
    }

    submitRegisterForm(){

        return cy.get(element.btnSubmit).click();

    }


}

export default new register();