/* eslint-disable no-unused-vars */
/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * 사용자 정의 명령어: 이벤트 폼을 채웁니다.
       * @param event 이벤트 데이터
       */
      fillEventForm(event: {
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        location: string;
        description: string;
        category: string;
        repeatType: string;
        repeatInterval: string;
        repeatEndCondition: string;
        repeatEndDate: string;
        notificationTime: string;
        isRepeating?: boolean;
      }): Chainable<Element>;
    }
  }
}

export {};
