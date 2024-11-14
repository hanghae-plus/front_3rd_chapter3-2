describe('캘린더 E2E 테스트', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('일정을 검색할 수 있다', () => {
    // 검색어 입력
    cy.get('[placeholder="검색어를 입력하세요"]').type('팀 회의');

    // 검색 결과 확인
    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('팀 회의').should('be.visible');
    });
  });

  it('월별/주별 뷰를 전환할 수 있다', () => {
    // 주별 뷰로 전환
    cy.get('[aria-label="view"]').select('week');
    cy.get('[data-testid="week-view"]').should('be.visible');

    // 월별 뷰로 전환
    cy.get('[aria-label="view"]').select('month');
    cy.get('[data-testid="month-view"]').should('be.visible');
  });
});
