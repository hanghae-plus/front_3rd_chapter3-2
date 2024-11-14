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
      repeat: { type: 'daily', interval: 2, endDate: '2024-11-15' },
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
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-15' },
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
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-15' },
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
        repeat: { type: 'daily', interval: 2, endDate: '2024-11-15' },
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
      repeat: { type: 'weekly', interval: 2, endDate: '2024-12-15' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toStrictEqual([
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2024-11-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-15' },
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
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-15' },
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
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-15' },
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
      repeat: { type: 'monthly', interval: 2, endDate: '2025-04-10' },
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
        repeat: { type: 'monthly', interval: 2, endDate: '2025-04-10' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2025-04-10' },
        notificationTime: 10,
      },
      {
        id: '1',
        title: '반복할 이벤트',
        date: '2025-03-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2025-04-10' },
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
        date: '2026-11-10',
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
        date: '2028-11-10',
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

  it('종료일이 지정되지 않은 경우 2025-06-30까지의 반복 일정 배열을 반환한다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 3 },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        category: '',
        date: '2024-11-10',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: {
          interval: 3,
          type: 'monthly',
        },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2025-02-10',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: {
          interval: 3,
          type: 'monthly',
        },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2025-05-10',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: {
          interval: 3,
          type: 'monthly',
        },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
    ]);
  });

  it('31일에 반복되는 일정일 경우 31일이 존재하지 않는 달에는 달의 마지막 날로 조정된다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-10-31',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-02-01' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        category: '',
        date: '2024-10-31',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-02-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2024-11-30',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-02-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2024-12-30',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-02-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2025-01-30',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-02-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
    ]);
  });

  it('2월 29일 기준 매년 반복되는 일정을 생성할 경우 평년일 때는 2월의 28일로 조정된다.', () => {
    const eventToRepeat: Event = {
      id: '1',
      title: '반복할 이벤트',
      date: '2024-02-29',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1, endDate: '2026-03-01' },
      notificationTime: 10,
    };

    const repeatedEvents = generateRepeatedEvents(eventToRepeat);

    expect(repeatedEvents).toEqual([
      {
        category: '',
        date: '2024-02-29',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'yearly', interval: 1, endDate: '2026-03-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2025-02-28',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'yearly', interval: 1, endDate: '2026-03-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
      {
        category: '',
        date: '2026-02-28',
        description: '',
        endTime: '10:00',
        id: '1',
        location: '',
        notificationTime: 10,
        repeat: { type: 'yearly', interval: 1, endDate: '2026-03-01' },
        startTime: '09:00',
        title: '반복할 이벤트',
      },
    ]);
  });
});
