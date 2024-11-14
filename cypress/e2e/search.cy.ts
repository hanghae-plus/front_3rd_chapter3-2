describe('검색 기능 E2E 테스트', () => {
  beforeEach(() => {
    cy.clock(new Date('2024-11-01').getTime());
    cy.intercept('GET', '/api/events').as('getEvents');
    cy.visit('http://localhost:5173');
    cy.wait('@getEvents');
  });

  it('검색어가 비어있을 때 모든 이벤트가 표시된다', () => {
    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('회의').should('exist');
      cy.contains('점심 약속').should('exist');
      cy.contains('운동').should('exist');
    });
  });

  it('검색어에 맞는 이벤트만 필터링된다', () => {
    cy.get('#search').type('회의');

    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('회의').should('exist');
      cy.contains('점심 약속').should('not.exist');
      cy.contains('운동').should('not.exist');
    });
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트가 표시된다', () => {
    cy.get('#search').type('점심', { force: true });

    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('점심 약속').should('exist');
      cy.contains('동료와 점심').should('exist');
      cy.contains('회의').should('not.exist');
    });
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트된다", () => {
    cy.get('#search').type('회의');

    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('회의').should('exist');
      cy.contains('점심 약속').should('not.exist');
    });

    cy.get('#search').clear();
    cy.get('#search').type('점심');

    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('회의').should('not.exist');
      cy.contains('점심 약속').should('exist');
    });
  });
});
