import { Event } from '../../types';
import { generateRepeatedEvents, getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        id: '4',
        title: '6월 마지막 날 이벤트',
        date: '2024-06-30',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      ...events,
      {
        id: '5',
        title: '8월 첫 날 이벤트',
        date: '2024-08-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(borderEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});

describe('generateRepeatedEvents', () => {
  describe('초기 설정', () => {
    it('🔴 이벤트의 repeat type이 "none" 일 시 빈 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(0);
    });
    it('🔴 이벤트의 repeat interval 0 일 시 빈 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 0 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(0);
    });
    it('🔴 이벤트의 repeat interval 음수일 시 빈 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: -1 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(0);
    });
  });
  describe('daily', () => {
    it('🟢 type 이 "daily" 이고 간격이 1일 경우 종료일까지 매일 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(183);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 type 이 "daily" 이고 간격이 5일 경우 종료일까지 매일 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 5, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(36);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-06',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 5, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 5, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
  });
  describe('weekly', () => {
    it('🟢 간격이 1일 경우 종료일까지 매주 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(26);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2일 경우 종료일까지 2주마다 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(13);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2이고 수요일 지정일 경우 종료일까지 2주마다 수요일씩 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31', weekType: 'wed' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(13);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31', weekType: 'wed' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-18',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 2, endDate: '2024-12-31', weekType: 'wed' },
        notificationTime: 0,
      });
    });
  });
  describe('monthly', () => {
    it('🟢 간격이 1일 경우 종료일까지 매월 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(5);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-08-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2일 경우 종료일까지 2개월마다 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(2);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-09-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'monthly', interval: 2, endDate: '2024-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 1이고 3주차 수요일일 경우 종료일까지 매월 3주차 수요일에 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(6);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-17',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-12-18',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2이고 3주차 수요일일 경우 종료일까지 2달마다 3주차 수요일에 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 2,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(3);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-17',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 2,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2024-11-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'monthly',
          interval: 2,
          endDate: '2024-12-31',
          weekType: 'wed',
          weekOrder: 3,
        },
        notificationTime: 0,
      });
    });
  });
  describe('yearly', () => {
    it('🟢 간격이 1일 경우 종료일까지 매년 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(6);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 1이고 11월 30일 지정일 경우 종료일까지 매년 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(7);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-11-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-11-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2이고 11월 30일 지정일 경우 종료일까지 2년마다 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(4);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-11-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-11-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31', monthType: 'nov', day: 30 },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 1이고 2월 29일 지정일 경우 종료일까지 매년 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'feb', day: 29 },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(6);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2025-02-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'feb', day: 29 },
        notificationTime: 0,
      });
      expect(result.at(-3)).toEqual({
        title: '이벤트 1',
        date: '2028-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'feb', day: 29 },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-02-28',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', monthType: 'feb', day: 29 },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2일 경우 종료일까지 2년마다 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31' },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(3);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2026-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31' },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'yearly', interval: 2, endDate: '2030-12-31' },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 1이고 7월 1주차 목요일 지정일 경우 종료일까지 매년 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2030-12-31',
          monthType: 'jul',
          weekOrder: 1,
          weekType: 'thu',
        },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(7);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-07-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2030-12-31',
          monthType: 'jul',
          weekOrder: 1,
          weekType: 'thu',
        },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-07-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2030-12-31',
          monthType: 'jul',
          weekOrder: 1,
          weekType: 'thu',
        },
        notificationTime: 0,
      });
    });
    it('🟢 간격이 2이고 10월 3주차 토요일 지정일 경우 종료일까지 2년마다 동일한 이벤트를 가진 배열을 반환한다.', () => {
      const testEvent: Event = {
        id: '1',
        title: '이벤트 1',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 2,
          endDate: '2030-12-31',
          monthType: 'oct',
          weekOrder: 3,
          weekType: 'sat',
        },
        notificationTime: 0,
      };
      const result = generateRepeatedEvents(testEvent);
      expect(result).toHaveLength(4);
      expect(result.at(0)).toEqual({
        title: '이벤트 1',
        date: '2024-10-19',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 2,
          endDate: '2030-12-31',
          monthType: 'oct',
          weekOrder: 3,
          weekType: 'sat',
        },
        notificationTime: 0,
      });
      expect(result.at(-1)).toEqual({
        title: '이벤트 1',
        date: '2030-10-19',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'yearly',
          interval: 2,
          endDate: '2030-12-31',
          monthType: 'oct',
          weekOrder: 3,
          weekType: 'sat',
        },
        notificationTime: 0,
      });
    });
  });
});
