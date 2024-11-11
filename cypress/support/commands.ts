import '@testing-library/cypress/add-commands';

Cypress.Commands.add('fillEventForm', (event) => {
  cy.findByLabelText('제목').type(event.title);
  cy.findByLabelText('날짜').type(event.date);
  cy.findByLabelText('시작 시간').type(event.startTime);
  cy.findByLabelText('종료 시간').type(event.endTime);
  cy.findByLabelText('위치').type(event.location);
  cy.findByLabelText('설명').type(event.description);
  cy.findByLabelText('카테고리').select(event.category);

  if (event.isRepeating) {
    cy.findByLabelText('반복 일정').check();
    cy.findByLabelText('반복 유형').select(event.repeatType);
    cy.findByLabelText('반복 간격').clear().type(`{selectall}${event.repeatInterval}`);
    cy.findByLabelText('반복 종료일').type(event.repeatEndDate);
  }

  cy.findByLabelText('알림 설정').select(event.notificationTime);
});

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
