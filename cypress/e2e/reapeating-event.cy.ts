/// <reference types= "cypress" />
describe('반복 일정 시나리오', () => {
  beforeEach(() => {
    cy.clock(new Date('2024-11-14').getTime());
    cy.visit('http://localhost:5173/');

    // MEMO: 일정 조회가 완료되는 것을 기다리기 위해 '/api/events'에 spy 설정
    // https://docs.cypress.io/api/commands/intercept#Syntax
    cy.intercept('GET', '/api/events').as('getEvents');
    cy.wait('@getEvents');
  });

  it('반복 일정을 추가할 수 있다', () => {
    cy.get('div#root').should('exist');

    cy.get('#title').type('데일리 미팅');
    cy.get('#date').type('2024-11-18');
    cy.get('#startTime').type('10:00');
    cy.get('#endTime').type('11:00');
    cy.get('#description').type('매일 진행하는 데일리 미팅');
    cy.get('#location').type('회의실 A');
    cy.get('#category').select('업무');
    cy.get('#isRepeating').check({ force: true });
    cy.get('#repeatEndDate').type('2024-11-22');
    cy.get('[data-testid="event-submit-button"]').click();

    cy.wait('@getEvents');

    cy.get('[data-testid="month-view"]')
      .get('[data-testid="repeat-icon"]')
      .should('have.length', 5);
  });

  it('반복 일정을 수정하면 단일 일정으로 변경된다', () => {
    cy.get('[data-testid="event-list"]').as('eventList');

    cy.get('@eventList')
      .contains('데일리 미팅')
      .parent()
      .parent()
      .parent()
      .parent()
      .should('not.contain.text', '회의실 D')
      .should('contain.text', '2024-11-18')
      .find('button[aria-label="Edit event"]')
      .click();

    cy.get('#title').should('have.value', '데일리 미팅');
    cy.get('#title').clear();
    cy.get('#title').type('수정된 데일리 미팅');
    cy.get('#description').should('have.value', '매일 진행하는 데일리 미팅');
    cy.get('#location').should('have.value', '회의실 A');
    cy.get('#location').clear();
    cy.get('#location').type('회의실 D');
    cy.get('[data-testid="event-submit-button"]').click();

    cy.wait('@getEvents');

    cy.get('@eventList').contains('회의실 D');

    cy.get('[data-testid="month-view"]')
      .get('[data-testid="repeat-icon"]')
      .should('have.length', 4);
  });

  it('반복 일정을 삭제하면 하나만 삭제된다', () => {
    cy.get('[data-testid="event-list"]').as('eventList');

    // parentsUntil
    cy.get('@eventList')
      .contains('수정된 데일리 미팅')
      .parent()
      .parent()
      .parent()
      .parent()
      .as('editedEvent');

    // 수정된
    cy.get('@editedEvent')
      .next()
      .should('contain.text', '2024-11-19')
      .find('button[aria-label="Delete event"]')
      .click();

    cy.wait('@getEvents');

    cy.get('@eventList').should('not.contain.text', '2024-11-19');

    cy.get('[data-testid="month-view"]')
      .get('[data-testid="repeat-icon"]')
      .should('have.length', 3);
  });
});
