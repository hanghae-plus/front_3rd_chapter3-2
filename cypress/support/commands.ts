/// <reference types="cypress" />
/* global JQuery */
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

declare global {
  namespace Cypress {
    interface Chainable {
      findItemByTitleInEventList(title: string): Cypress.Chainable<JQuery<HTMLElement>>;
      createEvent(form: Partial<EventForm>): void;
      deleteEventByTitle(title: string): void;
      updateEventByTitle(targetTitle: string, form: Partial<EventForm>): void;
    }
  }
}

import '@testing-library/cypress/add-commands';
import { EventForm } from '../../src/types';

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month}-${day}`;
};

Cypress.Commands.add('findItemByTitleInEventList', (title: string) => {
  return cy.findByTestId('event-list').findByText(title).parents('div').eq(2);
});

Cypress.Commands.add('deleteEventByTitle', (title: string) => {
  cy.findItemByTitleInEventList(title)?.findByLabelText('Delete event').click();
});

Cypress.Commands.add('createEvent', (form: Partial<EventForm>) => {
  const {
    title = '',
    date = getToday(),
    startTime = '00:00',
    endTime = '00:01',
    description = '',
    location = '',
    category = '',
  } = form;

  cy.findByLabelText('제목').type(title);
  cy.findByLabelText('날짜').type(date);
  cy.findByLabelText('시작 시간').type(startTime);
  cy.findByLabelText('종료 시간').type(endTime);
  cy.findByLabelText('설명').type(description);
  cy.findByLabelText('위치').type(location);
  cy.findByLabelText('카테고리').select(category);
  cy.findByRole('button', { name: '일정 추가' }).click();
});

Cypress.Commands.add('updateEventByTitle', (targetTitle: string, form: Partial<EventForm>) => {
  cy.findItemByTitleInEventList(targetTitle).findByLabelText('Edit event').click();
  const { title, date, startTime, endTime, description, location, category } = form;

  if (title) {
    cy.findByLabelText('제목').clear();
    cy.findByLabelText('제목').type(title);
  }
  if (date) {
    cy.findByLabelText('날짜').clear();
    cy.findByLabelText('날짜').type(date);
  }
  if (startTime) {
    cy.findByLabelText('시작 시간').clear();
    cy.findByLabelText('시작 시간').type(startTime);
  }
  if (endTime) {
    cy.findByLabelText('종료 시간').clear();
    cy.findByLabelText('종료 시간').type(endTime);
  }
  if (description) {
    cy.findByLabelText('설명').clear();
    cy.findByLabelText('설명').type(description);
  }
  if (location) {
    cy.findByLabelText('위치').clear();
    cy.findByLabelText('위치').type(location);
  }
  if (category) {
    cy.findByLabelText('카테고리').select(category);
  }

  cy.findByRole('button', { name: '일정 수정' }).click();
});
