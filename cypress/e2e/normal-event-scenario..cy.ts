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

describe('일반적인 일정 시나리오 테스트', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('일정을 추가합니다.', () => {
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

    cy.checkEvent('month', '일정 한번 추가해보자', 'visible');
    cy.findSearchedEvent(/2024-11-13/i).should('be.visible');
    cy.findSearchedEvent(/10:11/i).should('be.visible');
    cy.findSearchedEvent(/11:11/i).should('be.visible');
    cy.findSearchedEvent(/일정 한번 추가해보자 설명/i).should('be.visible');
    cy.findSearchedEvent(/일정 한번 추가해보자 위치/i).should('be.visible');
    cy.findSearchedEvent(/가족/i).should('be.visible');
    cy.findSearchedEvent(/알림: 10분 전/i).should('be.visible');
  });
  it('추가된 일정을 수정합니다.', () => {
    cy.findSearchedEvent('일정 한번 추가해보자').findByLabelText('Edit event').click();

    cy.eventFormTitle('일정 수정').should('be.visible');

    cy.editEvent({
      title: '일정 한번 수정해보자',
    });

    cy.checkEvent('month', '일정 한번 수정해보자', 'visible');
  });

  it('방금 수정한 일정을 삭제합니다.', () => {
    cy.deleteEvent('일정 한번 수정해보자');

    cy.checkEvent('month', '일정 한번 수정해보자', 'invisible');

    cy.findByText('일정이 삭제되었습니다.').should('be.visible');
  });
});
