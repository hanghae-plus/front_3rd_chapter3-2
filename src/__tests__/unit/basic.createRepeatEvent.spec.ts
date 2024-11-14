import { expect } from 'vitest';
import { createRepeatEvent } from '../../utils/createRepeatEvent';

describe('createRepeatEvent', () => {
  it('반복 날짜가 1일마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const event: Event = {
      title: '기존 일정',
      date: '2024-11-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-08' },
      notificationTime: 10,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-04',
      '2024-11-05',
      '2024-11-06',
      '2024-11-07',
      '2024-11-08',
    ]);
  });

  it('반복 날짜가 1주마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const event: Event = {
      title: '해리와 과제하기',
      date: '2024-11-11',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-09' },
      notificationTime: 0,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-11',
      '2024-11-18',
      '2024-11-25',
      '2024-12-02',
      '2024-12-09',
    ]);
  });

  it('반복 날짜가 1개월마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const event: Event = {
      title: '기존 일정',
      date: '2024-11-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-04-04' },
      notificationTime: 10,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-04',
      '2024-12-04',
      '2025-01-04',
      '2025-02-04',
      '2025-03-04',
      '2025-04-04',
    ]);
  });

  it('반복 날짜가 1년마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const event: Event = {
      title: '해리와 과제하기',
      date: '2024-11-11',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'yearly', interval: 1, endDate: '2028-11-11' },
      notificationTime: 0,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-11',
      '2025-11-11',
      '2026-11-11',
      '2027-11-11',
      '2028-11-11',
    ]);
  });

  it('반복 날짜가 2일마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const event: Event = {
      id: '1',
      title: '기존 일정',
      date: '2024-11-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 2, endDate: '2024-11-12' },
      notificationTime: 10,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-04',
      '2024-11-06',
      '2024-11-08',
      '2024-11-10',
      '2024-11-12',
    ]);
  });

  it('반복 날짜가 3주마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const event: Event = {
      title: '해리와 과제하기',
      date: '2024-11-11',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 3, endDate: '2025-01-31' },
      notificationTime: 0,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-11',
      '2024-12-02',
      '2024-12-23',
      '2025-01-13',
    ]);
  });

  it('반복 날짜가 3개월마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const event: Event = {
      title: '기존 일정',
      date: '2024-11-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 3, endDate: '2025-11-04' },
      notificationTime: 10,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-04',
      '2025-02-04',
      '2025-05-04',
      '2025-08-04',
      '2025-11-04',
    ]);
  });

  it('반복 일정이 종료 날짜 이전까지 정확하게 생성되어야 한다.', () => {
    const event: Event = {
      title: '해리와 과제하기',
      date: '2024-11-11',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-11-25' },
      notificationTime: 0,
    };

    const result = createRepeatEvent(event);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-11-11',
      '2024-11-18',
      '2024-11-25',
    ]);
  });

  it('종료 날짜가 없으면 반복 일정이 2025-06-30까지 생성된다.', () => {
    const event: Event = {
      title: '중요 회의',
      date: '2023-05-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 15,
    };

    const result = createRepeatEvent(event);
    const lastEventDate = result[result.length - 1].date;

    expect(lastEventDate).toEqual('2025-06-30');
  });

  it('사용자가 지정한 특정 횟수만큼 일정이 반복되어야 한다', () => {
    const event: Event = {
      title: '주간 회의',
      date: '2024-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 30,
    };

    const maxOccurrences = 5;
    const result = createRepeatEvent(event, maxOccurrences);
    const resultDates = result.map(e => e.date);

    expect(resultDates).toEqual([
      '2024-01-01',
      '2024-01-08',
      '2024-01-15',
      '2024-01-22',
      '2024-01-29',
    ]);
  });
});