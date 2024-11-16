import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  convertRepeatEventToEvents,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024/07/01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '25:00');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      date: '2024-07-01',
      startTime: '14:30',
      endTime: '15:30',
      title: '테스트 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2024-07-01T14:30:00'));
    expect(result.end).toEqual(new Date('2024-07-01T15:30:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '5',
      date: '2024/07/01', // 잘못된 형식
      startTime: '14:30',
      endTime: '15:30',
      title: '잘못된 날짜 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '6',
      date: '2024-07-01',
      startTime: '25:00', // 잘못된 형식
      endTime: '26:00', // 잘못된 형식
      title: '잘못된 시간 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '17:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '1',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '16:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const event2: Event = {
      id: '2',
      date: '2024-07-01',
      startTime: '16:00',
      endTime: '18:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvents: Event[] = [
    {
      id: '1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '12:00',
      title: '이벤트 1',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      date: '2024-07-01',
      startTime: '11:00',
      endTime: '13:00',
      title: '이벤트 2',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
      title: '이벤트 3',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2024-07-01',
      startTime: '11:30',
      endTime: '14:30',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toEqual([baseEvents[0], baseEvents[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '4',
      date: '2024-07-01',
      startTime: '13:00',
      endTime: '15:00',
      title: '새 이벤트',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };
    const result = findOverlappingEvents(newEvent, baseEvents);
    expect(result).toHaveLength(0);
  });
});

describe('convertRepeatEventToEvents', () => {
  it('반복 이벤트를 반복 간격에 따라 여러 이벤트로 변환한다', () => {
    const repeatEvent = {
      date: '2024-07-01',
      repeat: { type: 'daily', interval: 1, endDate: '2024-07-03' },
    } as EventForm;

    const result = convertRepeatEventToEvents(repeatEvent);
    expect(result).toHaveLength(3);
  });

  const repeatEvents = [
    {
      event: {
        date: '2024-07-01',
        repeat: { type: 'daily', interval: 1, endDate: '2024-07-03' },
      },
      expected: [
        { date: '2024-07-01', repeat: { type: 'daily', interval: 1, endDate: '2024-07-03' } },
        { date: '2024-07-02', repeat: { type: 'daily', interval: 1, endDate: '2024-07-03' } },
        { date: '2024-07-03', repeat: { type: 'daily', interval: 1, endDate: '2024-07-03' } },
      ],
    },
    {
      event: {
        date: '2024-07-01',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-07-21' },
      },
      expected: [
        { date: '2024-07-01', repeat: { type: 'weekly', interval: 1, endDate: '2024-07-21' } },
        { date: '2024-07-08', repeat: { type: 'weekly', interval: 1, endDate: '2024-07-21' } },
        { date: '2024-07-15', repeat: { type: 'weekly', interval: 1, endDate: '2024-07-21' } },
      ],
    },
    {
      event: {
        date: '2024-07-01',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-09-30' },
      },
      expected: [
        { date: '2024-07-01', repeat: { type: 'monthly', interval: 1, endDate: '2024-09-30' } },
        { date: '2024-08-01', repeat: { type: 'monthly', interval: 1, endDate: '2024-09-30' } },
        { date: '2024-09-01', repeat: { type: 'monthly', interval: 1, endDate: '2024-09-30' } },
      ],
    },
    {
      event: {
        date: '2024-07-01',
        repeat: { type: 'yearly', interval: 1, endDate: '2026-12-31' },
      },
      expected: [
        { date: '2024-07-01', repeat: { type: 'yearly', interval: 1, endDate: '2026-12-31' } },
        { date: '2025-07-01', repeat: { type: 'yearly', interval: 1, endDate: '2026-12-31' } },
        { date: '2026-07-01', repeat: { type: 'yearly', interval: 1, endDate: '2026-12-31' } },
      ],
    },
  ] as { event: EventForm; expected: Event[] }[];

  it.each(repeatEvents)('$event.repeat.type 반복 이벤트를 생성', ({ event, expected }) => {
    const result = convertRepeatEventToEvents(event);
    // 배열 확인
    expect(result).toEqual(expected);
  });

  it('달의 마지막 날짜에 대해 올바르게 처리한다.(2024년 윤년)', () => {
    const event = {
      date: '2024-01-31',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-05-31' },
    } as EventForm;

    const result = convertRepeatEventToEvents(event);

    expect(result[0].date).toBe('2024-01-31');
    expect(result[1].date).toBe('2024-02-29');
    expect(result[2].date).toBe('2024-03-31');
    expect(result[3].date).toBe('2024-04-30');
    expect(result[4].date).toBe('2024-05-31');
  });
});
