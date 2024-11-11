describe('캘린더 E2E 테스트', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('김항해가 매주 월요일 오전 10시에 팀 회의를 등록하고 관리하는 시나리오', () => {
    // 2. 정보 입력
    cy.findByLabelText('제목').type('주간 팀 회의');
    cy.findByLabelText('날짜').type('2024-07-01');
    cy.findByLabelText('시작 시간').type('10:00');
    cy.findByLabelText('종료 시간').type('11:00');
    cy.findByLabelText('위치').type('회의실 A');
    cy.findByLabelText('설명').type('주간 업무 보고 및 계획 수립');

    // 3. 반복 설정에서 "매주" 선택 및 반복 간격 설정
    cy.findByLabelText('반복 일정').check();
    cy.findByLabelText('반복 유형').select('매주');
    cy.findByLabelText('반복 간격').type('{selectall}1');

    // 5. 반복 종료 조건 설정
    cy.findByLabelText('반복 종료일').type('2024-12-31');

    // 6. 알림 설정
    cy.findByLabelText('알림 설정').select('10분 전');

    // 7. 일정을 저장
    cy.findByTestId('event-submit-button').click();

    // 캘린더에 추가된 일정 확인
    cy.contains('주간 팀 회의').should('exist');
    cy.contains('10:00 - 11:00').should('exist');
    cy.contains('회의실 A').should('exist');

    // // 8. 9월부터 회의 시간이 30분 연장
    // // 9. 9월 2일 일정을 선택하고 수정
    // cy.contains('주간 팀 회의').click();
    // cy.contains('이후 모든 일정 수정').click();

    // // 종료 시간 변경
    // cy.findByLabelText('종료 시간').clear().type('11:30');

    // // 변경 사항 저장
    // cy.findByTestId('event-submit-button').click();

    // // 10. 변경된 일정 확인
    // cy.contains('주간 팀 회의').should('exist');
    // cy.contains('10:00 - 11:30').should('exist');

    // 11. 9월 셋째 주 월요일(공휴일) 일정 취소
    // cy.get('[data-testid="date-cell-2024-09-16"]').click();
    // cy.contains('이 일정만 삭제').click();

    // // 12. 해당 날짜의 일정 삭제 확인
    // cy.contains('주간 팀 회의').should('not.exist');
  });
});
