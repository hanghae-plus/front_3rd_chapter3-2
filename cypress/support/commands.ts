/* eslint-disable cypress/unsafe-to-chain-command */
import '@testing-library/cypress/add-commands';

/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

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
