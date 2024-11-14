describe('캘린더 앱 테스트', () => {
  beforeEach(() => {
    cy.viewport('macbook-16');
    cy.visit('/');
  });

  describe('기본 UI 요소 확인', () => {
    it('[일정 추가, 일정 보기, 이벤트 리스트]가 모두 정상적으로 렌더링 된다', () => {
      cy.contains('일정 추가').should('exist');

      cy.contains('일정 보기').should('exist');

      cy.get('[data-testid="event-list"]').should('exist');
    });

    it('캘린더 뷰의  default는 month 이며, 전환시 타입에 맞는 뷰가 보인다', () => {
      cy.get('[data-testid="month-view"]').should('exist');

      cy.get('select[aria-label="view"]').select('week');
      cy.get('[data-testid="week-view"]').should('exist');

      cy.get('select[aria-label="view"]').select('month');
      cy.get('[data-testid="month-view"]').should('exist');
    });
  });

  describe('일정 추가 테스트', () => {
    beforeEach(() => {
      cy.exec(`echo '{
          "events": []
        }' > src/__mocks__/response/realEvents.json`);

      cy.visit('/');

      cy.get('[data-testid="event-list"]').should(($list) => {
        const text = $list.text();
        expect(text).to.include('검색 결과가 없습니다');
      });
    });

    it('반복 일정을 생성할 수 있다', () => {
      cy.contains('제목').next('input').type('반복을 만들어볼게 얍');
      cy.get('input[type="date"]').first().type('2024-11-18');
      cy.get('input[type="time"]').first().type('09:00');
      cy.get('input[type="time"]').last().type('10:00');

      cy.contains('반복 일정').click();
      cy.get('select').contains('매일').parent('select').select('daily');

      // eslint-disable-next-line cypress/unsafe-to-chain-command
      cy.contains('반복 간격').next('input').clear().type('{selectall}3');

      cy.contains('반복 종료일').next('input').type('2024-11-30');

      cy.get('[data-testid="event-submit-button"]').click();

      cy.get('[data-testid="event-list"]').within(() => {
        cy.contains('반복을 만들어볼게 얍');
        cy.get('[aria-label="repeat-icon"]').should('exist');
        cy.contains('반복: 3일마다');
        cy.contains('종료: 2024-11-30');
      });
    });
  });
});
