describe('일정 관리', () => {
  beforeEach(() => {
    cy.viewport(1400, 768);

    cy.clock(new Date('2024-11-12T10:00:00').getTime());

    cy.visit('/');
  });

  it('일정 추가/수정/삭제가 에러 없이 동작한다.', () => {
    cy.findByLabelText('제목').type('단일 일정');
    cy.findByLabelText('날짜').type('2024-11-15');
    cy.findByLabelText('시작 시간').type('12:00');
    cy.findByLabelText('종료 시간').type('13:00');
    cy.findByLabelText('설명').type('테스트 설명');
    cy.findByLabelText('위치').type('테스트 장소');
    cy.findByLabelText('카테고리').select('개인');

    cy.findByRole('button', { name: '일정 추가' }).click();

    // 이벤트 리스트 확인
    cy.get('[data-testid="event-list"]').findByText('단일 일정').should('exist');

    cy.get('[data-testid="event-list"]')
      .findByText('단일 일정')
      .parent()
      .parent()
      .parent()
      .as('evenItem');
    cy.get('@evenItem').findByLabelText('Edit event').click();

    // 정보 수정
    cy.findByLabelText('제목').clear();
    cy.findByLabelText('제목').type('수정된 일정');
    cy.findByLabelText('설명').clear();
    cy.findByLabelText('설명').type('수정된 설명');
    cy.findByLabelText('위치').clear();
    cy.findByLabelText('위치').type('수정된 장소');
    cy.findByLabelText('카테고리').select('업무');

    cy.findByRole('button', { name: '일정 수정' }).click();

    // 수정된 정보 확인
    cy.get('[data-testid="event-list"]').within(() => {
      cy.findByText('수정된 일정').should('exist');
      cy.findByText('수정된 설명').should('exist');
      cy.findByText('수정된 장소').should('exist');
      cy.contains('업무').should('exist');
    });

    // 일정 삭제
    cy.get('[data-testid="event-list"]')
      .findByText('수정된 일정')
      .parent()
      .parent()
      .parent()
      .as('evenItem');
    cy.get('@evenItem').findByLabelText('Delete event').click();

    // 삭제된 일정 확인
    cy.get('[data-testid="event-list"]').findByText('수정된 일정').should('not.exist');
  });

  it('반복 일정 추가 시 이벤트 리스트에 반복되는 일정들이 생성되고 삭제된다', () => {
    cy.findByLabelText('제목').type('반복 일정 제목');
    cy.findByLabelText('날짜').type('2024-11-15');
    cy.findByLabelText('시작 시간').type('12:00');
    cy.findByLabelText('종료 시간').type('13:00');
    cy.findByLabelText('설명').type('테스트 설명');
    cy.findByLabelText('위치').type('테스트 장소');
    cy.findByLabelText('카테고리').select('개인');

    cy.findByText('반복 설정').click();
    cy.findByLabelText('반복 종료일').type('2024-11-16');

    cy.findByRole('button', { name: '일정 추가' }).click();

    // 이벤트 리스트 확인
    cy.get('[data-testid="event-list"]').findAllByText('반복 일정 제목').should('have.length', 2);

    // 반복 일정 삭제
    cy.get('[data-testid="event-list"]').findAllByText('반복 일정 제목').as('dupEventItem');
    cy.get('@dupEventItem').each(($el) => {
      cy.wrap($el).parent().parent().parent().findByLabelText('Delete event').click;
    });

    cy.get('[data-testid="event-list"]').findByText('반복 일정 제목').should('not.exist');
  });
});
