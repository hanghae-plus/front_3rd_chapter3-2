beforeEach(() => {
  cy.visit('/');
});

describe('일반 일정 추가', () => {
  beforeEach(() => {
    cy.createEvent({
      title: '테스트 일정-1',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '개인',
    });
  });

  describe('Create / Update', () => {
    afterEach(() => {
      cy.deleteEventByTitle('테스트 일정-1');
    });

    it('"테스트 일정-1"을 생성한 경우 "일정이 추가되었습니다" 토스트가 노출된다', () => {
      cy.findByText('일정이 추가되었습니다.').should('exist');
    });

    it('일정을 추가한 경우 일정 목록에 "테스트 일정-1"및 관련 일정이 모두 올바르게 표현된다', () => {
      cy.findItemByTitleInEventList('테스트 일정-1').findByText('테스트 일정-1').should('exist');
      cy.findItemByTitleInEventList('테스트 일정-1').findByText('09:00 - 10:00').should('exist');
      cy.findItemByTitleInEventList('테스트 일정-1').findByText('테스트 설명').should('exist');
      cy.findItemByTitleInEventList('테스트 일정-1').findByText('테스트 위치').should('exist');
      cy.findItemByTitleInEventList('테스트 일정-1').findByText('카테고리: 개인').should('exist');
    });

    it('일정을 수정하는 경우 변경된 제목 "수정된 테스트 일정-1"이 일정 목록에 올바르게 표현된다', () => {
      cy.updateEventByTitle('테스트 일정-1', { title: '수정된 테스트 일정-1' });

      cy.findItemByTitleInEventList('수정된 테스트 일정-1')
        .findByText('수정된 테스트 일정-1')
        .should('exist');

      cy.updateEventByTitle('수정된 테스트 일정-1', { title: '테스트 일정-1' });
    });
  });

  it('삭제 버튼을 누른 경우 일정이 삭제되며, "일정이 삭제되었습니다"라는 토스트가 노출된다', () => {
    cy.deleteEventByTitle('테스트 일정-1');

    cy.findByText('일정이 삭제되었습니다.').should('exist');
  });
});

// ? 만약 추가한다면 반복 일정 정도 동일한 시나리오로 추가할 수 있지 않을까
