describe('일정 관리', () => {
  beforeEach(() => {
    cy.viewport(1400, 768);

    cy.clock(new Date('2024-11-12T10:00:00').getTime());

    cy.visit('/');

    // 기존 일정 모두 삭제
    cy.get('[aria-label="Delete event"]').each(($el) => {
      cy.wrap($el).click();
    });
  });

  it('단일 일정 추가 시 이벤트 리스트에 등록한 일정의 정보가 표시된다.', () => {
    cy.findByLabelText('제목').type('단일 일정');
    cy.findByLabelText('날짜').type('2024-11-15');
    cy.findByLabelText('시작 시간').type('12:00');
    cy.findByLabelText('종료 시간').type('13:00');
    cy.findByLabelText('설명').type('테스트 설명');
    cy.findByLabelText('위치').type('테스트 장소');
    cy.findByLabelText('카테고리').select('개인');

    cy.findByRole('button', { name: '일정 추가' }).click();

    // 이벤트 리스트 확인
    cy.get('[data-testid="event-list"]').findByText('단일 일정').should('have.length', 1);
  });

  it('반복 일정 추가 시 이벤트 리스트에 반복되는 일정들이 생성되어 표시된다.', () => {
    cy.findByLabelText('제목').type('반복 일정 제목');
    cy.findByLabelText('날짜').type('2024-11-15');
    cy.findByLabelText('시작 시간').type('12:00');
    cy.findByLabelText('종료 시간').type('13:00');
    cy.findByLabelText('설명').type('테스트 설명');
    cy.findByLabelText('위치').type('테스트 장소');
    cy.findByLabelText('카테고리').select('개인');

    cy.findByText('반복 설정').click();
    cy.findByLabelText('반복 종료일').type('2024-11-20');

    cy.findByRole('button', { name: '일정 추가' }).click();

    // 이벤트 리스트 확인
    cy.get('[data-testid="event-list"]').findAllByText('반복 일정 제목').should('have.length', 6);
  });
});
