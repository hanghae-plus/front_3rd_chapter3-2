describe('캘린더 E2E 테스트', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('사용자가 2024-07-01 부터 매주 월요일 오전 10시에 반복 일정를 등록하고 수정,삭제하는 시나리오', () => {
    // 일정 로딩 확인
    cy.contains('일정 로딩 완료!').should('exist');

    cy.fillEventForm({
      title: '주간 팀 회의',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실 A',
      description: '주간 업무 보고 및 계획 수립',
      category: '업무',
      isRepeating: true,
      repeatType: '매주',
      repeatInterval: '1',
      repeatEndCondition: '종료일 지정',
      repeatEndDate: '2024-12-31',
      notificationTime: '10분 전',
    });

    cy.findByTestId('event-submit-button').click();

    // 일정 저장 확인
    cy.contains('일정이 추가되었습니다.').should('exist');
    // 일정 확인
    cy.contains('주간 팀 회의').should('exist');
    cy.contains('10:00 - 11:00').should('exist');
    cy.contains('회의실 A').should('exist');

    // 회의 시간 수정
    cy.contains('2024-11-11')
      .parent() // 부모 요소로 이동 (Box)
      .parent() // 부모 요소로 이동 (Box)
      .within(() => {
        cy.findByLabelText('Edit event').click();
      });

    cy.findByLabelText('종료 시간').clear().type('11:30');
    cy.findByTestId('event-submit-button').click();

    // 일정 수정 확인
    cy.contains('일정이 수정되었습니다.').should('exist');
    // 수정된 일정 확인
    cy.contains('2024-11-11').should('exist');
    cy.contains('10:00 - 11:30').should('exist');

    // 9월 셋째 주 월요일(공휴일) 일정 취소
    cy.get('[aria-label="Previous"]').click();
    cy.get('[aria-label="Previous"]').click();
    // cy.contains('이 일정만 삭제').click();
    cy.contains('2024-09-16')
      .parent() // 부모 요소로 이동 (Box)
      .parent() // 부모 요소로 이동 (Box)
      .within(() => {
        cy.findByLabelText('Delete event').click();
      });

    // 일정 삭제 확인
    cy.contains('일정이 삭제되었습니다.').should('exist');
    // 해당 날짜의 일정 삭제 확인
    cy.contains('2024-09-16').should('not.exist');
  });
});
