describe('캘린더 뷰 E2E 테스트', () => {
  beforeEach(() => {
    cy.clock(new Date('2024-10-01').getTime());
    cy.visit('http://localhost:5173');
  });

  describe('초기 상태', () => {
    it('초기 뷰는 월간이어야 한다', () => {
      cy.get('[data-testid="month-view"]').should('be.visible');
      cy.get('[data-testid="week-view"]').should('not.exist');
    });

    it('10월 휴일(개천절, 한글날)이 표시되어야 한다', () => {
      cy.contains('개천절').should('be.visible');
      cy.contains('한글날').should('be.visible');
    });
  });

  describe('뷰 변경', () => {
    it('주간 뷰로 변경이 가능하다', () => {
      cy.get('[aria-label="view"]').select('week');
      cy.get('[data-testid="week-view"]').should('be.visible');
      cy.get('[data-testid="month-view"]').should('not.exist');
    });
  });

  describe('월간 뷰 네비게이션', () => {
    it('다음 달로 이동하면 11월로 이동한다', () => {
      cy.get('[aria-label="Next"]').click();
      cy.get('[data-testid="current-date"]').should('contain', '2024년 11월');
    });

    it('이전 달로 이동하면 9월로 이동한다', () => {
      cy.get('[aria-label="Previous"]').click();
      cy.get('[data-testid="current-date"]').should('contain', '2024년 9월');
    });
  });

  describe('주간 뷰 네비게이션', () => {
    beforeEach(() => {
      cy.get('[aria-label="view"]').select('week');
    });

    it('다음 주로 이동하면 7일 후인 10월 8일이 포함된다', () => {
      cy.get('[aria-label="Next"]').click();
      cy.contains('2024-10-08').should('be.visible');
    });

    it('이전 주로 이동하면 7일 전인 9월 24일이 포함된다', () => {
      cy.get('[aria-label="Previous"]').click();
      cy.contains('2024-09-26').should('be.visible');
    });
  });

  describe('날짜 변경에 따른 휴일 업데이트', () => {
    it('1월로 이동하면 신정이 표시된다', () => {
      for (let i = 0; i < 9; i++) {
        cy.get('[aria-label="Previous"]').click();
      }

      cy.contains('신정').should('be.visible');
    });
  });
});
