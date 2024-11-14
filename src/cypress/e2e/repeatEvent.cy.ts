import { eventFactory } from '../../__mocks__/Factory';
import { TEST_ID } from '../../constants/testID';
import { Event } from '../../types';

function fillEventForm(events) {
  events.forEach((event) => {
    if (event.type === 'date') {
      cy.get(`[data-testid="${event.testId}"]`).clear()!.type(event.value);
    }

    if (event.type === 'input') {
      cy.get(`[data-testid="${event.testId}"]`).type('{selectall}' + event.value);
    }

    if (event.type === 'select') {
      cy.get(`[data-testid="${event.testId}"]`).select(event.value);
    }

    if (event.type === 'check') {
      cy.get(`[data-testid="${event.testId}"]`).then((checkbox) => {
        const isChecked = checkbox.attr('data-checked') !== undefined;
        if (isChecked !== event.value) cy.wrap(checkbox).click();
      });
    }
  });
}

let MOCK_EVENTS = [] as Event[];
describe('-', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2024, 10 - 1, 1), ['Date']);
    MOCK_EVENTS = [];

    // GET: 모든 이벤트 조회
    cy.intercept('GET', '/api/events', (req) => {
      req.reply({
        statusCode: 200,
        body: { events: MOCK_EVENTS },
      });
    }).as('getEvent');

    // POST: 새로운 이벤트 추가
    cy.intercept('POST', '/api/events', (req) => {
      const newEvent = req.body;
      const updatedEvent = { id: Cypress._.uniqueId('event_'), ...newEvent };
      MOCK_EVENTS = [...MOCK_EVENTS, updatedEvent];

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
    cy.wait('@getEvent');
  });

  it('테스트 환경 초기값인 2024년 10월로 달력이 표기된다.', () => {
    cy.contains('2024년 10월');
  });

  describe('일정 추가 시, 일정 관리 화면에 추가한 일정이 표시된다.', () => {
    it('추가한 일정이 반복 주기 설정에 따라 캘린더 뷰에 표시된다.', () => {
      // GIVEN: 4일 단위 반복 설정된 일정 데이터 생성
      const NEW_EVENT = eventFactory.build({
        title: '4일단위 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 4, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 인풋에 일정 데이터 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // THEN: 일정 시작일에 일정 정보가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('4일단위 반복').should('exist'); // 이벤트 제목 확인
      });

      // THEN: 반복 설정에 맞는 일자에 일정 데이터가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-05"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('4일단위 반복').should('exist'); // 이벤트 제목 확인
      });
    });

    it('캘린더 뷰에 반복일정이 시각적으로 표시되어 구분된다.', () => {
      // GIVEN: 4일 단위 반복 설정된 일정 데이터 생성한다.
      const EVENT_4DAY = eventFactory.build({
        title: '4일단위 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 4, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });
      // GIVEN: 2주 단위 반복 설정된 일정 데이터 생성한다.
      const EVENT_2WEEK = eventFactory.build({
        title: '2주단위 반복',
        date: '2024-10-01',
        repeat: { type: 'weekly', interval: 2, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 각 일정을 순서대로 입력하고 추가한다.
      fillEventForm([
        { type: 'input', testId: TEST_ID.FORM.TITLE, value: EVENT_4DAY.title },
        { type: 'date', testId: TEST_ID.FORM.DATE, value: EVENT_4DAY.date },
        { type: 'date', testId: TEST_ID.FORM.START_TIME, value: EVENT_4DAY.startTime },
        { type: 'date', testId: TEST_ID.FORM.END_TIME, value: EVENT_4DAY.endTime },
        { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: EVENT_4DAY.description },
        { type: 'input', testId: TEST_ID.FORM.LOCATION, value: EVENT_4DAY.location },
        { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: EVENT_4DAY.category },
        { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
        { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: EVENT_4DAY.repeat.type },
        { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: EVENT_4DAY.repeat.interval },
        {
          type: 'select',
          testId: TEST_ID.FORM.NOTIFICATION_TIME,
          value: String(EVENT_4DAY.notificationTime),
        },
      ]);
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      fillEventForm([
        { type: 'input', testId: TEST_ID.FORM.TITLE, value: EVENT_2WEEK.title },
        { type: 'date', testId: TEST_ID.FORM.DATE, value: EVENT_2WEEK.date },
        { type: 'date', testId: TEST_ID.FORM.START_TIME, value: EVENT_2WEEK.startTime },
        { type: 'date', testId: TEST_ID.FORM.END_TIME, value: EVENT_2WEEK.endTime },
        { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: EVENT_2WEEK.description },
        { type: 'input', testId: TEST_ID.FORM.LOCATION, value: EVENT_2WEEK.location },
        { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: EVENT_2WEEK.category },
        { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
        { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: EVENT_2WEEK.repeat.type },
        { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: EVENT_2WEEK.repeat.interval },
        {
          type: 'select',
          testId: TEST_ID.FORM.NOTIFICATION_TIME,
          value: String(EVENT_2WEEK.notificationTime),
        },
      ]);
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`).click();
      cy.get(`[data-testid="${TEST_ID.FORCE_SAVE}"]`).click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // THEN: 일정 시작일에 일정 정보가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('4일단위 반복').should('exist'); // 이벤트 제목 확인
      });

      // THEN: 반복 설정에 맞는 일자에 일정 데이터가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-15"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('weekly').should('exist'); // 반복 타입 확인
        cy.contains('2주단위 반복').should('exist'); // 이벤트 제목 확인
      });
    });

    it('캘린더 뷰에 반복 종료일이 있다면 표시된다.', () => {
      // GIVEN: 4일 단위 반복 설정된 일정 데이터 생성
      const NEW_EVENT = eventFactory.build({
        title: '4일단위 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 4, endDate: '2024-10-17' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 인풋에 일정 데이터 입력하고 일정을 추가한다.
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
        { type: 'date', testId: TEST_ID.FORM.REPEAT_END_DATE, value: NEW_EVENT.repeat.endDate },
        {
          type: 'select',
          testId: TEST_ID.FORM.NOTIFICATION_TIME,
          value: String(NEW_EVENT.notificationTime),
        },
      ]);
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // THEN: 일정 시작일에 일정 정보가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-17"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('반복 종료').should('exist'); // 반복 종료 확인
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('4일단위 반복').should('exist'); // 이벤트 제목 확인
      });
    });

    it('달의 말일에 반복설정을 하면 매달 말일에 알림이 생성된다.', () => {
      // GIVEN: 말일 반복 설정된 일정 데이터 생성
      const NEW_EVENT = eventFactory.build({
        title: '10월부터 말일 반복 ex)31일,30일',
        date: '2024-10-31',
        repeat: { type: 'monthly', interval: 1, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 인풋에 일정 데이터 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // THEN: 말일에 일정의 정보가 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-31"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('monthly').should('exist'); // 반복 타입 확인
        cy.contains('10월부터 말일 반복 ex)31일,30일').should('be.visible'); // 이벤트 제목 확인
      });

      // WHEN: 다음 달 버튼을 클릭해 11월 달력을 조회할 때
      cy.get(`[data-testid="${TEST_ID.NEXT}"]`).click();

      // THEN: 말일에 반복 설정된 일정이 11월 말일에 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-11-30"]').within(() => {
        cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
        cy.contains('monthly').should('exist'); // 반복 타입 확인
        cy.contains('10월부터 말일 반복 ex)31일,30일').should('exist'); // 이벤트 제목 확인
      });
    });
  });

  describe('일정 수정 시, "모든 일정 수정"과 "해당 일정만 수정"을 할 수 있다.', () => {
    it('반복 일정을 수정하면 단일 일정으로 변경된다.', () => {
      // GIVEN: 매일 반복 일정 데이터를 생성한다.
      const NEW_EVENT = eventFactory.build({
        title: '매일 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 1, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 매일 반복 일정 데이터를 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // WHEN: 다음날의 일정을 클릭해 편집인풋에 데이터를 넣는다.
      cy.get('[data-testid="calendar-2024-10-02"]')
        .within(() => {
          cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
          cy.contains('daily').should('exist'); // 반복 타입 확인
          cy.contains('매일 반복').should('exist'); // 일정 제목 확인
        })!
        .click();

      // WHEN: 일정을 편집하고 '해당 일정만 수정'버튼을 클릭해 단일 일정으로 저장한다.
      fillEventForm([
        { type: 'input', testId: TEST_ID.FORM.TITLE, value: '단일 일정' },
        { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: false },
      ]);
      cy.get(`[data-testid="${TEST_ID.SPLIT_RECURRING_EVENT_BUTTON}"]`)
        .should('contain.text', '해당 일정만 수정')
        .click();

      cy.wait('@getEvent');

      // THEN: 기존 반복일정이 수정되면 안된다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('매일 반복').should('exist'); // 일정 제목 확인
      });

      // THEN: 단일 일정으로 저장되어야 한다.
      cy.get('[data-testid="calendar-2024-10-02"]').within(() => {
        cy.contains('단일 일정').should('exist'); // 일정 제목 확인
      });
    });

    it('반복 설정된 일정을 수정할 때, "모든 일정 수정"버튼을 누르면 일괄 수정할 수 있다.', () => {
      // GIVEN: 매일 반복 일정 데이터를 생성한다.
      const NEW_EVENT = eventFactory.build({
        title: '매일 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 1, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 매일 반복 일정 데이터를 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@addEvent');
      cy.wait('@getEvent');

      // WHEN: 다음날의 일정을 클릭해 편집인풋에 데이터를 넣는다.
      cy.get('[data-testid="calendar-2024-10-02"]')
        .within(() => {
          cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
          cy.contains('daily').should('exist'); // 반복 타입 확인
          cy.contains('매일 반복').should('exist'); // 일정 제목 확인
        })!
        .click();

      // WHEN: 일정을 편집하고 '해당 일정만 수정'버튼을 클릭해 단일 일정으로 저장한다.
      fillEventForm([
        { type: 'input', testId: TEST_ID.FORM.TITLE, value: '일괄 4일 반복 수정' },
        { type: 'date', testId: TEST_ID.FORM.DATE, value: '2024-10-01' },
        { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
        { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: 'daily' },
        { type: 'input', testId: TEST_ID.FORM.INTERVAL, value: '4' },
      ]);
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '모든 일정 수정')
        .click();
      cy.get(`[data-testid="${TEST_ID.FORCE_SAVE}"]`).click();

      cy.wait('@updateEvent');
      cy.wait('@getEvent');

      // THEN: 기존 반복일정이 수정된다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('일괄 4일 반복 수정').should('exist'); // 일정 제목 확인

        cy.contains('매일 반복').should('not.exist'); // 이전 일정 없는지 확인
      });

      // THEN: 4일 후 일정에도 표시되어야 한다.
      cy.get('[data-testid="calendar-2024-10-05"]').within(() => {
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('일괄 4일 반복 수정').should('exist'); // 일정 제목 확인

        cy.contains('매일 반복').should('not.exist'); // 이전 일정 없는지 확인
      });
    });
  });

  describe('일정 삭제 시, "전체 일정 삭제"과 "해당 일정만 삭제"을 할 수 있다.', () => {
    it('"해당 일정만 삭제"버튼으로 해당 일정만 삭제할 수 있다.', () => {
      // GIVEN: 매일 반복 일정 데이터를 생성한다.
      const NEW_EVENT = eventFactory.build({
        title: '매일 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 1, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 매일 반복 일정 데이터를 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();
      cy.wait('@getEvent');

      // WHEN: 다음날의 일정을 클릭해 편집인풋에 데이터를 넣는다.
      cy.get('[data-testid="calendar-2024-10-02"]')
        .within(() => {
          cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
          cy.contains('daily').should('exist'); // 반복 타입 확인
          cy.contains('매일 반복').should('exist'); // 일정 제목 확인
        })!
        .click();

      // WHEN: 해당 일정만 삭제 클릭
      cy.get(`[data-testid="${TEST_ID.REMOVE_RECURRING_EVENT_BUTTON}"]`)
        .should('contain.text', '해당 일정만 삭제')
        .click();

      cy.wait('@getEvent');

      // THEN: 기존 반복일정은 유지된다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.contains('daily').should('exist'); // 반복 타입 확인
        cy.contains('매일 반복').should('exist'); // 일정 제목 확인
      });

      // THEN: 삭제한 일정에는 표시되지 않아야 한다.
      cy.get('[data-testid="calendar-2024-10-02"]').within(() => {
        cy.contains('daily').should('not.exist'); // 반복 타입 없는지 확인
        cy.contains('매일 반복').should('not.exist'); // 이전 일정 없는지 확인
      });
    });

    it('"전체 일정 삭제"버튼으로 반복 일정을 삭제할 수 있다.', () => {
      // GIVEN: 매일 반복 일정 데이터를 생성한다.
      const NEW_EVENT = eventFactory.build({
        title: '매일 반복',
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 1, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });

      // WHEN: 매일 반복 일정 데이터를 입력하고 일정을 추가한다.
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
      cy.get(`[data-testid="${TEST_ID.SUBMIT_BUTTON}"]`)
        .should('contain.text', '일정 추가')
        .click();

      cy.wait('@getEvent');

      // WHEN: 다음날의 일정을 클릭해 편집인풋에 데이터를 넣는다.
      cy.get('[data-testid="calendar-2024-10-02"]')
        .within(() => {
          cy.get('.chakra-icon').should('exist'); // 반복 아이콘 확인
          cy.contains('daily').should('exist'); // 반복 타입 확인
          cy.contains('매일 반복').should('exist'); // 일정 제목 확인
        })!
        .click();

      // WHEN: '전체 일정 삭제' 클릭해 일괄 삭제한다.
      cy.get(`[data-testid="${TEST_ID.REMOVE_EVENT_BUTTON}"]`)
        .should('contain.text', '전체 일정 삭제')
        .click();

      cy.wait('@getEvent');

      // THEN: 일정이 제거되어야 한다.
      cy.get('[data-testid="calendar-2024-10-01"]').within(() => {
        cy.get('.chakra-icon').should('not.exist'); // 반복 아이콘 확인
        cy.contains('daily').should('not.exist'); // 반복 타입 확인
        cy.contains('매일 반복').should('not.exist'); // 일정 제목 확인
      });
      cy.get('[data-testid="calendar-2024-10-02"]').within(() => {
        cy.get('.chakra-icon').should('not.exist'); // 반복 아이콘 제거 확인
        cy.contains('daily').should('not.exist'); // 반복 타입 제거 확인
        cy.contains('매일 반복').should('not.exist'); // 일정 제목 제거 확인
      });
    });
  });
});
