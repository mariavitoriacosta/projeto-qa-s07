const element = require('./elements').ELEMENTS;
const elementHeader = require('../superiorMenu/elements').ELEMENTS;

class login{

    validateLoginPage(){

        cy.url('/login').then(() => {
            cy.contains('Sign in');
        });
    }

    loginWithInvalidCredentials(username, password){
        cy.get(element.emailInput)
            .should('have.attr','type', 'email')
            .and('have.attr','placeholder', 'Email')
            .type(username);

         cy.get(element.passwordInput)
            .should('have.attr','type', 'password')
            .and('have.attr','placeholder', 'Password')
            .type(password); 
            
        return cy.get(element.loginButton).contains('Login').click();
        
    }

    loginWithValidCredentials(email, password){
        cy.get(element.emailInput)
            .should('have.attr','type', 'email')
            .and('have.attr','placeholder', 'Email')
            .type(email);

         cy.get(element.passwordInput)
            .should('have.attr','type', 'password')
            .and('have.attr','placeholder', 'Password')
            .type(password); 
            
         cy.get(element.loginButton).contains('Login').click();

    }

    toLogout(){
        return cy.get(elementHeader.profileIcon).click().then(() => {
            cy.get(elementHeader.profileMenu)
                    .contains('Logout').click();             
        });  
    }

    acessarPaginaRegistro(){
        
        return cy.contains(element.registerLinkText).click();
    }

    
};

export default new login();