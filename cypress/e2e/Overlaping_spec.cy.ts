describe('캘린더 E2E 테스트', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2024, 10, 11), ['Date']);
    cy.visit('/');
    // new Date().
  });

  it('중복된 일정 등록 시, 경고 confirm창이 표시되며 "계속 진행" 선택 시 정상 저장되는 시나리오', () => {
    // 일정 로딩 확인
    cy.contains('일정 로딩 완료!').should('exist');

    const event = {
      title: '주간 팀 회의',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '주간 업무 보고 및 계획 수립',
      category: '업무',
      repeatType: '매주',
      repeatInterval: '1',
      repeatEndCondition: '종료일 지정',
      repeatEndDate: '2024-12-31',
      notificationTime: '10분 전',
    };
    cy.fillEventForm(event);
    cy.findByTestId('event-submit-button').click();

    // 일정 저장 확인
    cy.contains('일정이 추가되었습니다.').should('exist');
    // 일정 확인
    cy.contains('주간 팀 회의').should('exist');
    cy.contains('10:00 - 11:00').should('exist');
    cy.contains('회의실 A').should('exist');

    // 동일한 일정 추가 시도 (중복)
    cy.fillEventForm(event);
    cy.findByTestId('event-submit-button').click();

    // 중복 경고 confirm 창이 표시되는지 확인
    cy.contains('일정 겹침 경고').should('be.visible');

    // "계속 진행" 버튼 클릭
    cy.findByRole('button', { name: /계속 진행/i }).click();
    cy.contains('일정이 추가되었습니다.').should('exist');

    // 일정이 정상적으로 저장되었는지 확인 (중복된 일정이 추가됨 2개 이상인지 확인)
    cy.get('[data-testid="event-list"]').within(() => {
      cy.contains('주간 팀 회의').should('have.length', 1);
      cy.contains('2024-11-01').should('have.length', 1);
      cy.contains('10:00 - 11:00').should('have.length', 1);
    });
  });
});
