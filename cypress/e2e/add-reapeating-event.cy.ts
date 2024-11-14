describe('페이지 접속 테스트', () => {
  it('passes', () => {
    cy.clock(new Date('2024-11-14').getTime());
    cy.visit('http://localhost:5173/');

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
  });
});
