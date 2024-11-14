import '@testing-library/cypress/add-commands';

Cypress.Commands.add('addEvent', (data) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    repeat,
  } = data;
  // 제목 입력
  cy.findByLabelText('제목').type(title);

  // 날짜 선택
  cy.findByLabelText('날짜').type(date);

  // 시작 시간 선택
  cy.findByLabelText('시작 시간').type(startTime);

  // 종료 시간 선택
  cy.findByLabelText('종료 시간').type(endTime);

  // 설명 입력
  cy.findByLabelText('설명').type(description);

  // 위치 입력
  cy.findByLabelText('위치').type(location);

  // 카테고리 선택
  cy.findByTestId('category-select').select(category);

  // 알림 설정
  cy.findByTestId('notification-select').select(notificationTime.toString());

  // 반복 설정
  cy.findByTestId('is-repeat-checkbox')
    .should('exist')
    .then(($checkbox) => {
      const isChecked = $checkbox.children().prop('checked');
      cy.log(`Checkbox is checked: ${isChecked}`);
      if (repeat.type !== 'none' && !isChecked) {
        cy.findByTestId('is-repeat-checkbox').click();
      }

      if (repeat.type === 'none' && isChecked) {
        cy.findByTestId('is-repeat-checkbox').click();
      }
    });

  if (repeat.type !== 'none') {
    // 반복 유형 선택
    cy.findByTestId('repeat-select').select(repeat.type);
    // 반복 간격 설정
    cy.findByTestId('repeat-interval').clear();
    cy.findByTestId('repeat-interval').type(repeat.interval.toString());

    // 반복 종료일 설정
    if (repeat.endDate) {
      cy.findByTestId('repeat-end-date').type(repeat.endDate);
    }
  }
  // 일정 추가 버튼 클릭
  cy.findByTestId('event-submit-button').click();
});

Cypress.Commands.add('eventFormTitle', (title) => {
  cy.findByRole('heading', { name: title, level: 2 });
});

Cypress.Commands.add('findSearchedEvent', (title) => {
  cy.findByTestId('event-list').findByText(title).parents('[data-testid="event-item"]');
});

Cypress.Commands.add('findAllSearchedEvent', (title) => {
  cy.findByTestId('event-list').findAllByText(title).parents('[data-testid="event-item"]');
});

Cypress.Commands.add('deleteEvent', (title) => {
  cy.findByTestId('event-list')
    .findByText(title)
    .parents('[data-testid="event-item"]')
    .findByLabelText('Delete event')
    .click({ force: true });
});

Cypress.Commands.add('navigateTo', (direction) => {
  if (direction === 'next') {
    cy.findByTestId('next-month-button').click();
  } else {
    cy.findByTestId('prev-month-button').click();
  }
});

Cypress.Commands.add('checkEvent', (view, title, type, multiple) => {
  const viewTestId = view === 'month' ? 'month-view' : 'week-view';
  if (type === 'visible') {
    if (multiple) {
      cy.findByTestId(viewTestId).findAllByText(title).should('have.length', multiple);
    } else {
      cy.findByTestId(viewTestId).findByText(title).should('be.visible');
    }
  } else {
    cy.findByTestId(viewTestId).findByText(title).should('not.exist');
  }
});

Cypress.Commands.add('editEvent', (data) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    repeat,
  } = data;
  // 제목 입력
  if (title) {
    cy.findByLabelText('제목').clear();
    cy.findByLabelText('제목').type(title);
  }

  // 날짜 선택
  if (date) {
    cy.findByLabelText('날짜').clear();
    cy.findByLabelText('날짜').type(date);
  }

  // 시작 시간 선택
  if (startTime) {
    cy.findByLabelText('시작 시간').clear();
    cy.findByLabelText('시작 시간').type(startTime);
  }

  // 종료 시간 선택
  if (endTime) {
    cy.findByLabelText('종료 시간').clear();
    cy.findByLabelText('종료 시간').type(endTime);
  }

  // 설명 입력
  if (description) {
    cy.findByLabelText('설명').clear();
    cy.findByLabelText('설명').type(description);
  }

  // 위치 입력
  if (location) {
    cy.findByLabelText('위치').clear();
    cy.findByLabelText('위치').type(location);
  }

  // 카테고리 선택
  if (category) {
    cy.findByLabelText('카테고리').select(category);
  }

  // 알림 설정
  if (notificationTime) {
    cy.findByTestId('notification-select').select(notificationTime.toString());
  }

  // 반복 설정
  if (repeat) {
    cy.findByTestId('is-repeat-checkbox').click();
  }
  if (repeat && repeat.type !== 'none') {
    // 반복 유형 선택
    cy.findByTestId('repeat-select').select(repeat.type);
    // 반복 간격 설정
    cy.findByTestId('repeat-interval').clear();
    cy.findByTestId('repeat-interval').type(repeat.interval.toString());

    // 반복 종료일 설정
    cy.findByTestId('repeat-end-date').clear();
    cy.findByTestId('repeat-end-date').type(repeat.endDate ?? '');
  }
  // 일정 추가 버튼 클릭
  cy.findByTestId('event-submit-button').click();
});
