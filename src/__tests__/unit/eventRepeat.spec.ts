import { expect } from 'vitest';

import { Event } from '../../types.ts';
import { generateRepeatedEvents } from '../../utils/eventRepeat.ts';

describe('generateRepeatedEvents', () => {
  it('2일 간격으로 발생하고 5일 후 종료되는 반복 일정 배열을 반환한다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents({
      id: '1',
      title: '반복할 이벤트',
      date: '2024-02-30',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
      notificationTime: 10,
    });

    expect(repeatedEvents).toEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-12',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-14',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
        notificationTime: 10,
      },
    ]);
  });

  it('2주 간격으로 발생하고 5주 후 종료되는 반복 일정 배열을 반환한다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 2, endDate: '2024-01-14' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-01-14' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-24',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-01-14' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-12-08',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-01-14' },
        notificationTime: 10,
      },
    ]);
  });

  it('2개월 간격으로 발생하고 5개월 후 종료되는 반복 일정 배열을 반환한다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 2, endDate: '2024-04-10' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2024-04-10' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2024-04-10' },
        notificationTime: 10,
      },
    ]);
  });

  it('2년 간격으로 발생하고 4년 후 종료되는 반복 일정 배열을 반환한다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 2, endDate: '2028-11-10' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2028-11-10' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2026-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2028-11-10' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2028-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2028-11-10' },
        notificationTime: 10,
      },
    ]);
  });

  it('종료일이 지정되지 않은 경우 종료 없이 반복된 이벤트가 생성된다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 10 },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 10 },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2034-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 10 },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2044-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 10 },
        notificationTime: 10,
      },
    ]);
  });
});
