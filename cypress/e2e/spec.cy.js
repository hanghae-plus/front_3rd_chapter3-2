import { worker } from '../../src/__mocks__/worker';

before(() => {
  worker.start();
});

Cypress.on('test:before:run', () => {
  worker.resetHandlers();
});

describe('일정관리 앱 기본', () => {
  it('앱을 열고 실행한다.', () => {
    cy.visit('http://localhost:5173/');
    cy.reload();
  });
});

describe('일정 추가', () => {
  it('일정을 추가하면 반복일정도 함께 추가된다.', () => {
    cy.get('[id="field-:r1:"]').as('form-title');
    cy.get('[id="field-:r3:"]').as('form-date');
    cy.get('[id="field-:r5:"]').as('form-startTime');
    cy.get('[id="field-:rb:"]').as('form-endTime');
    cy.get('[id="field-:rh:"]').as('form-desription');
    cy.get('[id="field-:rj:"]').as('form-location');
    cy.get('[id="field-:rl:"]').as('form-category');
    cy.get('[id="field-:rn:"]').as('form-repeatCheck');
    cy.get('[id="field-:rv:"]').as('form-repeatEnd');

    cy.get('@form-title').type('카이 하베르츠');
    cy.get('@form-date').type('2024-11-14');
    cy.get('@form-startTime').type('11:11');
    cy.get('@form-endTime').type('15:15');
    cy.get('@form-desription').type('아스날 9번');
    cy.get('@form-location').type('북런던');
    cy.get('@form-category').select('개인');
    cy.get('@form-repeatCheck').should('be.checked');
    cy.get('@form-repeatEnd').type('2024-11-20');
    cy.get('[data-testid=event-submit-button]').click();

    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("카이 하베르츠")')
      .should('have.length', 7);

    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("🔂 카이 하베르츠")')
      .should('have.length', 6);
  });

  it('추가한 일정 중 반복일정 한개를 삭제한다.', () => {
    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("🔂 카이 하베르츠")')
      .should('have.length', 6);

    cy.get('[aria-label="Delete event"]').last().click();

    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("🔂 카이 하베르츠")')
      .should('have.length', 5);
  });

  it('반복일정을 수정하면 그 일정은 메인일정이 된다.', () => {
    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("🔂 카이 하베르츠")')
      .should('have.length', 5);

    cy.get('[aria-label="Edit event"]').last().click();

    cy.get('[id="field-:r1:"]').as('form-title');
    cy.get('[id="field-:r3:"]').as('form-date');
    cy.get('[id="field-:r5:"]').as('form-startTime');
    cy.get('[id="field-:rb:"]').as('form-endTime');
    cy.get('[id="field-:rh:"]').as('form-desription');
    cy.get('[id="field-:rj:"]').as('form-location');
    cy.get('[id="field-:rl:"]').as('form-category');
    cy.get('[id="field-:rn:"]').as('form-repeatCheck');

    cy.get('@form-title').clear();
    cy.get('@form-title').type('덕배');
    cy.get('@form-date').clear();
    cy.get('@form-date').type('2024-11-30');
    cy.get('@form-startTime').clear();
    cy.get('@form-startTime').type('11:11');
    cy.get('@form-endTime').clear();
    cy.get('@form-endTime').type('15:15');
    cy.get('@form-desription').clear();
    cy.get('@form-desription').type('맨시티');
    cy.get('@form-location').clear();
    cy.get('@form-location').type('맨체스터');
    cy.get('@form-category').select('개인');
    cy.get('@form-repeatCheck').parent().click();
    cy.get('@form-repeatCheck').should('not.be.checked');
    cy.get('[data-testid=event-submit-button]').click();

    cy.get('[data-testid="event-list"]').find('.css-19iv9lz').eq(1).contains('덕배');

    cy.get('[data-testid="event-list"]')
      .find('p')
      .filter('*:contains("🔂 카이 하베르츠")')
      .should('have.length', 4);
  });
});
