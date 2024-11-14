describe('반복 종료일이 없는 반복 일정 시나리오 테스트', () => {
  before(() => {
    cy.task('resetDb');
    const now = new Date(2024, 10, 13);
    cy.clock(now.getTime());
  });

  afterEach(() => {
    cy.clock().then((clock) => {
      clock.restore();
    });
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('일간 반복 일정을 추가합니다.', () => {
    cy.addEvent({
      title: '일정 한번 추가해보자',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정 한번 추가해보자 설명',
      location: '일정 한번 추가해보자 위치',
      category: '업무',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 10,
    });

    cy.checkEvent('month', '일정 한번 추가해보자', 'visible', 15);
  });
  it('하나의 반복 일정을 수정 시 일반적인 일정으로 바뀝니다.', () => {
    cy.findAllSearchedEvent('일정 한번 추가해보자')
      .last()
      .findByLabelText('Edit event')

      .click({ force: true });

    cy.eventFormTitle('일정 수정').should('be.visible');

    cy.editEvent({
      title: '일정 한번 수정해보자',
      repeat: { type: 'none', interval: 0 },
    });

    cy.checkEvent('month', `일정 한번 수정해보자`, 'visible');
    cy.checkEvent('month', `반복 일정 캘린더 2024-11-01`, 'invisible');
  });

  it('방금 수정한 일정을 삭제합니다.', () => {
    cy.deleteEvent('일정 한번 수정해보자');

    cy.checkEvent('month', '일정 한번 수정해보자', 'invisible');

    cy.findByText('일정이 삭제되었습니다.').should('be.visible');
  });
});

describe('반복 종료일이 있는 반복 일정 시나리오 테스트', () => {
  before(() => {
    cy.task('resetDb');
  });

  beforeEach(() => {
    cy.visit('/');
  });
  it('반복 종료일을 추가한 일간 반복 일정을 추가합니다.', () => {
    cy.addEvent({
      title: '일정 한번 추가해보자',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '일정 한번 추가해보자 설명',
      location: '일정 한번 추가해보자 위치',
      category: '업무',
      repeat: { type: 'daily', interval: 2, endDate: '2024-11-14' },
      notificationTime: 10,
    });

    cy.checkEvent('month', '일정 한번 추가해보자', 'visible', 7);
  });
  it('하나의 반복 일정을 수정 시 일반적인 일정으로 바뀝니다.', () => {
    cy.findAllSearchedEvent('일정 한번 추가해보자')
      .first()
      .findByLabelText('Edit event')

      .click({ force: true });

    cy.eventFormTitle('일정 수정').should('be.visible');

    cy.editEvent({
      title: '일정 한번 수정해보자',
      repeat: { type: 'none', interval: 0 },
    });

    cy.checkEvent('month', `일정 한번 수정해보자`, 'visible');
    cy.checkEvent('month', `반복 일정 캘린더 2024-11-13`, 'invisible');
  });

  it('방금 수정한 일정을 삭제합니다.', () => {
    cy.deleteEvent('일정 한번 수정해보자');

    cy.checkEvent('month', '일정 한번 수정해보자', 'invisible');

    cy.findByText('일정이 삭제되었습니다.').should('be.visible');
  });
});
