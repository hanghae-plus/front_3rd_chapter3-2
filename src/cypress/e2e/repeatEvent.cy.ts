import { eventFactory } from '../../__mocks__/Factory';
import { TEST_ID } from '../../constants/testID';
import { Event } from '../../types';

function fillEventForm(events) {
  events.forEach((event) => {
    if (event.type === 'date') {
      cy.get(`[data-testid="${event.testId}"]`).clear().type(event.value);
    }

    if (event.type === 'input') {
      cy.get(`[data-testid="${event.testId}"]`)
        .clear()
        .type('{selectall}' + event.value);
    }

    if (event.type === 'select') {
      cy.get(`[data-testid="${event.testId}"]`).select(event.value);
    }

    if (event.type === 'check') {
      cy.get(`[data-testid="${event.testId}"]`).then((checkbox) => {
        const isChecked = checkbox.attr('data-checked') === 'true'; // 'data-checked' 속성 확인

        if (!isChecked && event.value) cy.wrap(checkbox).click();
        if (isChecked && !event.value) cy.wrap(checkbox).click();
      });
    }
  });
}

let MOCK_EVENTS = [] as Event[];
describe('Example Test', () => {
  beforeEach(() => {
    cy.visit('');

    cy.clock(Date.UTC(2024, 10 - 1, 1), ['Date']);

    MOCK_EVENTS = [];
    // GET: 모든 이벤트 조회
    cy.intercept('GET', '/api/events', {
      statusCode: 200,
      body: { events: MOCK_EVENTS },
    }).as('getEvent');

    // POST: 새로운 이벤트 추가
    cy.intercept('POST', '/api/events', (req) => {
      const newEvent = req.body;
      const updatedEvent = { id: Cypress._.uniqueId('event_'), ...newEvent };
      MOCK_EVENTS = [...MOCK_EVENTS, updatedEvent];

      console.log(MOCK_EVENTS);

      req.reply({
        statusCode: 201,
        body: updatedEvent,
      });
    }).as('addEvent');

    // PUT: 특정 ID 이벤트 업데이트
    cy.intercept('PUT', '/api/events/*', (req) => {
      const id = req.url.match(/\/api\/events\/(\w+)/)[1]; // URL에서 ID 추출
      const updatedEvent = req.body;
      const index = MOCK_EVENTS.findIndex((event) => event.id === id);

      if (index === -1) {
        req.reply({
          statusCode: 404,
          body: { message: 'Event not found' },
        });
      } else {
        MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...updatedEvent };
        req.reply({
          statusCode: 200,
          body: MOCK_EVENTS[index],
        });
      }
    }).as('updateEvent');

    // DELETE 요청 가로채기 (특정 ID의 이벤트 삭제)
    cy.intercept('DELETE', '/api/events/*', (req) => {
      const id = req.url.match(/\/api\/events\/(\w+)/)[1]; // URL에서 ID 추출
      const index = MOCK_EVENTS.findIndex((event) => event.id === id);

      if (index === -1) {
        req.reply({
          statusCode: 404,
          body: { message: 'Event not found' },
        });
      } else {
        MOCK_EVENTS = MOCK_EVENTS.filter((event) => event.id !== id);
        req.reply({
          statusCode: 204,
          body: null,
        });
      }
    }).as('deleteEvent');

    cy.visit('/http://localhost:5173');
  });

  it('테스트 환경 초기값인 2024년 10월로 달력이 표기된다.', () => {
    cy.contains('2024년 10월');
  });

  it('달의 말일에 반복설정을 하면 매달 말일에 알림이 생성된다.', () => {
    const NEW_EVENT = eventFactory.build({
      title: '10월부터 말일 반복 ex)31일,30일',
      date: '2024-10-31',
      repeat: { type: 'monthly', interval: 1, endDate: '' },
      notificationTime: 10,
      exceptionList: [],
    });

    fillEventForm([
      { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
      { type: 'date', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
      { type: 'date', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
      { type: 'date', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
      { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
      { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
      { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
      { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
      { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: NEW_EVENT.repeat.type },
      { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: NEW_EVENT.repeat.interval },
      {
        type: 'select',
        testId: TEST_ID.FORM.NOTIFICATION_TIME,
        value: String(NEW_EVENT.notificationTime),
      },
    ]);

    cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).should('contain.text', '일정 추가').click();

    cy.wait('@addEvent');
    cy.wait('@getEvent');

    cy.get('[data-testid="calendar-2024-10-31"]').within(() => {
      cy.contains('10월부터 말일 반복 ex)31일,30일').should('be.visible'); // 이벤트 제목 확인
    });

    cy.get(`[data-testid="${TEST_ID.NEXT}"]`).click();

    cy.wait('@getEvent');

    cy.get('[data-testid="calendar-2024-11-30"]').within(() => {
      cy.contains('10월부터 말일 반복 ex)31일,30일').should('exist'); // 이벤트 제목 확인
    });
  });

  it('캘린더 뷰에서 반복일정을 시각적으로 구분하여 표시한다.', () => {
    const NEW_EVENT = eventFactory.build({
      title: '첫번째 일정',
      date: '2024-10-31',
      repeat: { type: 'monthly', interval: 1, endDate: '' },
      notificationTime: 10,
      exceptionList: [],
    });

    fillEventForm([
      { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
      { type: 'date', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
      { type: 'date', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
      { type: 'date', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
      { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
      { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
      { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
      { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
      { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: NEW_EVENT.repeat.type },
      { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: NEW_EVENT.repeat.interval },
      {
        type: 'select',
        testId: TEST_ID.FORM.NOTIFICATION_TIME,
        value: String(NEW_EVENT.notificationTime),
      },
    ]);

    cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).should('contain.text', '일정 추가').click();

    const NEW_EVENT_2 = eventFactory.build({
      title: '두번째 일정',
      date: '2024-10-02',
      repeat: { type: 'monthly', interval: 1, endDate: '' },
      notificationTime: 10,
      exceptionList: [],
    });

    fillEventForm([
      { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT_2.title },
      { type: 'date', testId: TEST_ID.FORM.DATE, value: NEW_EVENT_2.date },
      { type: 'date', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT_2.startTime },
      { type: 'date', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT_2.endTime },
      { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT_2.description },
      { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT_2.location },
      { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT_2.category },
      { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
      { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: NEW_EVENT_2.repeat.type },
      { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: NEW_EVENT_2.repeat.interval },
      {
        type: 'select',
        testId: TEST_ID.FORM.NOTIFICATION_TIME,
        value: String(NEW_EVENT_2.notificationTime),
      },
    ]);

    cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).should('contain.text', '일정 추가').click();

    cy.wait('@addEvent');
    cy.wait('@getEvent');

    cy.get('[data-testid="calendar-2024-10-31"]').within(() => {
      cy.contains('.chakra-icon').should('exist'); // 반복 아이콘 확인
      cy.contains('monthly').should('exist'); // 반복 아이콘 확인
      cy.contains('첫번째 일정').should('exist'); // 일정 제목 확인
    });

    cy.get('[data-testid="calendar-2024-10-02"]').within(() => {
      cy.contains('.chakra-icon').should('exist'); // 반복 아이콘 확인
      cy.contains('monthly').should('exist'); // 반복 아이콘 확인
      cy.contains('두번째 일정').should('exist'); // 일정 제목 확인
    });
  });

  it('반복 일정을 수정하면 단일 일정으로 변경된다.', () => {
    const NEW_EVENT = eventFactory.build({
      title: '매일 반복',
      date: '2024-10-01',
      repeat: { type: 'daily', interval: 1, endDate: '' },
      notificationTime: 10,
      exceptionList: [],
    });

    fillEventForm([
      { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
      { type: 'date', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
      { type: 'date', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
      { type: 'date', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
      { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
      { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
      { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
      { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
      { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: NEW_EVENT.repeat.type },
      { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: NEW_EVENT.repeat.interval },
      {
        type: 'select',
        testId: TEST_ID.FORM.NOTIFICATION_TIME,
        value: String(NEW_EVENT.notificationTime),
      },
    ]);

    cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).should('contain.text', '일정 추가').click();

    cy.wait('@addEvent');
    cy.wait('@getEvent');

    cy.get('[data-testid="calendar-2024-10-02"]')
      .within(() => {
        cy.contains('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('daily').should('exist'); // 반복 아이콘 확인
        cy.contains('매일 반복').should('exist'); // 일정 제목 확인
      })
      .click();

    fillEventForm([
      { type: 'input', testId: TEST_ID.FORM.TITLE, value: '단일 일정' },
      { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: false },
    ]);

    cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
      .should('contain.text', '해당 일정만 추가')
      .click();

    cy.wait('@addEvent');
    cy.wait('@getEvent');

    cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
      cy.contains('.chakra-icon').should('exist'); // 반복 아이콘 확인
      cy.contains('daily').should('exist'); // 반복 아이콘 확인
      cy.contains('매일 반복').should('exist'); // 일정 제목 확인
    });
    cy.get('[data-testid="calendar-2024-10-02"]')
      .within(() => {
        cy.contains('단일 일정').should('exist'); // 일정 제목 확인
      })
      .click();
  });
});
