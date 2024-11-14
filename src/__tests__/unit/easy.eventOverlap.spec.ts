import { createEvent } from '../../__mocks__/Factory';
import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toStrictEqual(new Date('2024-07-01T14:30'));
  });

  test.each([
    { date: '2024-13-01', time: '14:30' },
    { date: '2024-13-01', time: '14:30' },
    { date: '2024-00-10', time: '14:30' },
    { date: '2024-02-30', time: '14:30' },
    { date: 'test-mo-ck', time: '14:30' },
  ])('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', ({ date, time }) => {
    const result = parseDateTime(date, time);
    expect(result.toString()).toBe('Invalid Date');
  });

  test.each([
    { date: '2024-11-06', time: 'ab:cd' },
    { date: '2024-11-01', time: ' : ' },
    { date: '2024-11-10', time: '64:30' },
    { date: '2024-11-30', time: '!@:30' },
    { date: '2024-11-04', time: '|:30' },
    { date: '2024-11-06', time: '::30' },
  ])('잘못된 시간 형식에 대해 Invalid Date를 반환한다', ({ date, time }) => {
    const result = parseDateTime(date, time);
    expect(result.toString()).toBe('Invalid Date');
  });

  test.each([
    { date: '2024-11-', time: '11:30' },
    { date: '2024--04', time: '11:30' },
    { date: '-11-06', time: '11:30' },
  ])('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', ({ date, time }) => {
    const result = parseDateTime(date, time);
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  test.each([
    {
      event: createEvent({
        date: '2024-11-06',
        startTime: '00:00',
        endTime: '01:00',
      }),
      expected: { start: new Date('2024-11-06T00:00'), end: new Date('2024-11-06T01:00') },
    },
    {
      event: createEvent({
        date: '2023-04-06',
        startTime: '14:00',
        endTime: '16:01',
      }),
      expected: { start: new Date('2023-04-06T14:00'), end: new Date('2023-04-06T16:01') },
    },
  ])(
    '일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다',
    ({ event, expected }: { event: Event | EventForm; expected: { start: Date; end: Date } }) => {
      const result = convertEventToDateRange(event);
      expect(result).toStrictEqual(expected);
    }
  );

  test.each([
    createEvent({
      date: '2024-16-06',
      startTime: '00:00',
      endTime: '01:00',
    }),
    createEvent({
      date: '2024--1-06',
      startTime: '00:00',
      endTime: '01:00',
    }),
  ])('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', (event: Event | EventForm) => {
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  test.each([
    createEvent({
      date: '2024-12-67',
      startTime: '16:00',
      endTime: '23:00',
    }),
    createEvent({
      date: '2024-46-06',
      startTime: '18:00',
      endTime: '20:00',
    }),
  ])('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', (event: Event | EventForm) => {
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  test.each([
    createEvent({
      date: '2024-12-06',
      startTime: '16:00',
      endTime: '01:00',
    }),
    createEvent({
      date: '2024-01-06',
      startTime: '24:00',
      endTime: '01:00',
    }),
  ])('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', (event: Event | EventForm) => {
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  test.each([
    createEvent({
      date: '2024-12-06',
      startTime: '01:00',
      endTime: '02:00',
    }),
    createEvent({
      date: '2024-01-06',
      startTime: '02:00',
      endTime: '03:00',
    }),
  ])('두 이벤트가 겹치는 경우 true를 반환한다', (event: Event | EventForm) => {
    const result = isOverlapping(event, event);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = createEvent({
      date: '2024-01-06',
      startTime: '01:00',
      endTime: '02:00',
    });
    const event2 = createEvent({
      date: '2024-02-06',
      startTime: '02:00',
      endTime: '03:00',
    });
    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const events = [
    createEvent({ id: '1', startTime: '00:00', endTime: '01:00' }),
    createEvent({ id: '2', startTime: '22:00', endTime: '23:00' }),
    createEvent({ id: '3', startTime: '21:00', endTime: '22:00' }),
  ] as Event[];

  test.each([...events])(
    '새 이벤트와 겹치는 모든 이벤트를 반환한다',
    ({ id, startTime, endTime }) => {
      const newEvent = createEvent({ id: '4', startTime, endTime });
      const result = findOverlappingEvents(newEvent, events);
      expect(result).toEqual([createEvent({ id, startTime, endTime })]);
    }
  );

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent = createEvent({ id: '4', startTime: '10:00', endTime: '11:00' });
    const result = findOverlappingEvents(newEvent, events);
    expect(result).toEqual([]);
  });
});
