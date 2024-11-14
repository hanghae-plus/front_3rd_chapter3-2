/* eslint-disable no-unused-vars */
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

type EventData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  exceptionDates?: string[];
  notificationTime: number;
  repeat: {
    type: RepeatType;
    interval: number;
    endDate?: string;
  };
  id?: string;
};

declare namespace Cypress {
  interface Chainable {
    addEvent(data: EventData): Chainable<Element>;
    editEvent(data: Partial<EventData>): Chainable<Element>;
    deleteEvent(title: string | RegExp): Chainable<Element>;
    findSearchedEvent(title: string | RegExp): Chainable<Element>;
    findAllSearchedEvent(title: string | RegExp): Chainable<Element>;
    checkEvent(
      view: 'month' | 'week',
      title: string | RegExp,
      type: 'visible' | 'invisible',
      multiple?: number
    ): Chainable<Element>;
    eventFormTitle(title: string | RegExp): Chainable<Element>;
    navigateTo(direction: 'next' | 'prev'): Chainable<Element>;
    findSearchedEvent(title: string | RegExp): Chainable<Element>;
  }
}
