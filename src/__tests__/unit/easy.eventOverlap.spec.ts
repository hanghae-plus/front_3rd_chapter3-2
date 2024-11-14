import { Event, EventForm } from '../../types';

import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '@/features/event/lib/eventOverlap';

describe('parseDateTime', () => {
  it('2024-11-03 03:25을 정확한 Date 객체로 변환한다', () => {
    const parsed = parseDateTime('2024-11-03', '03:25');
    expect(parsed).toEqual(new Date('2024-11-03T03:25'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const parsed = parseDateTime('2024-13-03', '03:25');
    expect(parsed).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const parsed = parseDateTime('2024-11-03', '25:30');
    expect(parsed).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const parsed = parseDateTime('', '03:25');
    expect(parsed).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const event: EventForm[] = [
    {
      title: '회의',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
    {
      title: '회의',
      date: '2024-99-99',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
    {
      title: '회의',
      date: '2024-11-01',
      startTime: '33:00',
      endTime: '34:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
    {
      title: '회의',
      date: '2024-11-01',
      startTime: '12:00',
      endTime: '34:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
    {
      title: '회의',
      date: '2024-11-01',
      startTime: '33:00',
      endTime: '12:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
  ];

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const converted = convertEventToDateRange(event[0]);
    expect(converted).toEqual({
      start: new Date('2024-11-01T10:00'),
      end: new Date('2024-11-01T11:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const converted = convertEventToDateRange(event[1]);
    expect(converted).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    // 모든 시간 형식이 잘못된 경우
    const converted = convertEventToDateRange(event[2]);
    expect(converted).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });

    // 시작 시간이 잘못된 경우
    const converted2 = convertEventToDateRange(event[3]);
    expect(converted2).toEqual({
      start: new Date('2024-11-01T12:00'),
      end: new Date('Invalid Date'),
    });

    // 종료 시간이 잘못된 경우
    const converted3 = convertEventToDateRange(event[4]);
    expect(converted3).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('2024-11-01T12:00'),
    });
  });
});

const event: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '회의',
    date: '2024-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 30,
  },
  {
    id: '3',
    title: '회의',
    date: '2024-11-02',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 30,
  },
];
describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const isOverlapped = isOverlapping(event[0], event[1]);
    expect(isOverlapped).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const isOverlapped = isOverlapping(event[0], event[2]);
    expect(isOverlapped).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent = { ...event[0], id: event.length + 1 };
    const overlappingEvents = findOverlappingEvents(newEvent, event);
    expect(overlappingEvents).toEqual([event[0], event[1]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const overlappingEvents = findOverlappingEvents(event[0], [event[2]]);
    expect(overlappingEvents).toEqual([]);
  });
});
