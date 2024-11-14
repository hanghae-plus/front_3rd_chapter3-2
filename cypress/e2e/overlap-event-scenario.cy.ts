before(() => {
  cy.task('resetDb');

  const now = new Date(2024, 10, 13);
  cy.clock(now.getTime());
});

after(() => {
  cy.clock().then((clock) => {
    clock.restore();
  });
});

describe('겹치는 일정 추가에 대한 시나리오 테스트', () => {
  beforeEach(() => {
    cy.visit('/');

    cy.task('resetDb');

    cy.addEvent({
      title: '일정 한번 추가해보자',
      date: '2024-11-13',
      startTime: '10:11',
      endTime: '11:11',
      description: '일정 한번 추가해보자 설명',
      location: '일정 한번 추가해보자 위치',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  it('일정을 추가합니다.', () => {
    cy.checkEvent('month', '일정 한번 추가해보자', 'visible');
  });

  it('시간이 겹치면 뜨는 경고창에서 취소를 누르면 경고창이 사라집니다.', () => {
    cy.addEvent({
      title: '일정 한번 추가해보자',
      date: '2024-11-13',
      startTime: '10:30',
      endTime: '11:30',
      description: '일정 한번 추가해보자 설명',
      location: '일정 한번 추가해보자 위치',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
    cy.findByText('일정 겹침 경고').should('be.visible');
    cy.findByText(/2024-11-13 10:11-11:11/i).should('be.visible');

    cy.findByText('일정 겹침 경고')
      .parent()
      .within(() => cy.findByText('취소').click());

    cy.findByText('일정 겹침 경고').should('not.exist');
  });
  it('시간이 겹치면 뜨는 경고창에서 확인을 누르면 일정이 추가됩니다.', () => {
    cy.addEvent({
      title: '일정 한번 추가해보자',
      date: '2024-11-13',
      startTime: '10:30',
      endTime: '11:30',
      description: '일정 한번 추가해보자 설명',
      location: '일정 한번 추가해보자 위치',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
    cy.findByText('일정 겹침 경고').should('be.visible');
    cy.findByText(/2024-11-13 10:11-11:11/i).should('be.visible');

    cy.findByText('일정 겹침 경고')
      .parent()
      .within(() => cy.findByText('계속 진행').click());

    cy.findByText('일정 겹침 경고').should('not.exist');
    cy.checkEvent('month', '일정 한번 추가해보자', 'visible', 2);
  });
});
