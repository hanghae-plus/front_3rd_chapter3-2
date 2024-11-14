import { Event } from '../../types';
import { createRepeatEvents } from '../../utils/createRepeatEvent';

describe('반복 이벤트 생성하기', () => {
  const baseEvent: Omit<Event, 'repeat'> = {
    id: '1',
    title: '점심 약속',
    date: '2024-11-12',
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    location: '',
    category: '',
    notificationTime: 10,
  };

  describe('기본 동작', () => {
    it('반복 없는 이벤트는 repeat type이 none인 이벤트가 배열에 담겨 반환된다', () => {
      const noRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'none', interval: 0 },
      };
      const results = createRepeatEvents(noRepeatEvent);

      expect(results).toEqual([
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-12',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);
    });

    it('종료일이 시작일보다 이전인 경우, 단일 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-09' },
      };

      const results = createRepeatEvents(event);

      expect(results).toHaveLength(1);
      expect(results[0].date).toBe('2024-11-12');
    });
  });

  describe('일간 반복', () => {
    it('1일 간격으로 반복 설정 시, 시작일부터 종료일까지 매일 이벤트가 생성된다', () => {
      const dailyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 1, endDate: '2024-11-14' },
      };
      const results = createRepeatEvents(dailyRepeatEvent);

      expect(results).toEqual([
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-12',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'daily', interval: 1, endDate: '2024-11-14' },
          notificationTime: 10,
        },
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-13',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'daily', interval: 1, endDate: '2024-11-14' },
          notificationTime: 10,
        },
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-14',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'daily', interval: 1, endDate: '2024-11-14' },
          notificationTime: 10,
        },
      ]);
    });

    it('3일 간격으로 반복 설정 시, 시작일부터 종료일까지 3일 단위로 이벤트가 생성된다', () => {
      const dailyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 3, endDate: '2024-11-16' },
      };
      const results = createRepeatEvents(dailyRepeatEvent);

      expect(results).toEqual([
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-12',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'daily', interval: 3, endDate: '2024-11-16' },
          notificationTime: 10,
        },
        {
          id: '1',
          title: '점심 약속',
          date: '2024-11-15',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'daily', interval: 3, endDate: '2024-11-16' },
          notificationTime: 10,
        },
      ]);
    });
  });

  describe('주간 반복', () => {
    it('1주 간격으로 반복 설정 시, 시작일부터 종료일까지 매주 같은 요일에 이벤트가 생성된다', () => {
      const weeklyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-21' },
      };
      const results = createRepeatEvents(weeklyRepeatEvent);

      expect(results).toHaveLength(2);
      expect(results.map((event) => event.date)).toEqual(['2024-11-12', '2024-11-19']);
    });

    it('3주 간격으로 반복 설정 시, 시작일부터 종료일까지 3주 단위로 같은 요일에 이벤트가 생성된다', () => {
      const weeklyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 3, endDate: '2024-11-16' },
      };
      const results = createRepeatEvents(weeklyRepeatEvent);

      expect(results).toHaveLength(2);
      expect(results.map((event) => event.date)).toEqual(['2024-11-12', '2024-11-15']);
    });
  });

  describe('월간 반복', () => {
    it('1달 간격으로 반복 설정 시, 시작일부터 종료일까지 매월 같은 날짜에 이벤트가 생성된다', () => {
      const monthlyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-21' },
      };
      const results = createRepeatEvents(monthlyRepeatEvent);

      expect(results).toHaveLength(2);
      expect(results.map((event) => event.date)).toEqual(['2024-11-12', '2024-12-12']);
    });

    it('3달 간격으로 반복 설정 시, 시작일부터 종료일까지 3달 단위로 같은 날짜에 이벤트가 생성된다', () => {
      const monthlyRepeatEvent: Event = {
        ...baseEvent,
        repeat: { type: 'monthly', interval: 3, endDate: '2025-03-21' },
      };
      const results = createRepeatEvents(monthlyRepeatEvent);

      expect(results).toHaveLength(2);
      expect(results.map((event) => event.date)).toEqual(['2024-11-12', '2025-02-12']);
    });

    it('월말일(31일)에 반복되는 경우 31일이 있는 달만 이벤트를 생성하여 반환하다.', () => {
      const monthlyRepeatEvent: Event = {
        id: '1',
        title: '점심 약속',
        date: '2024-10-31',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        notificationTime: 10,
        repeat: { type: 'monthly', interval: 1, endDate: '2025-04-01' },
      };

      const results = createRepeatEvents(monthlyRepeatEvent);

      expect(results.map((event) => event.date)).toEqual([
        '2024-10-31',
        '2024-12-31',
        '2025-01-31',
        '2025-03-31',
      ]);
    });
  });

  describe('연간 반복', () => {
    it('1년 간격으로 반복 설정 시, 매년 같은 날짜에 이벤트가 생성된다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'yearly', interval: 1, endDate: '2026-01-01' },
      };

      const results = createRepeatEvents(event);

      expect(results.map((event) => event.date)).toEqual(['2024-11-12', '2025-11-12']);
    });

    it('윤년의 2월 29일에 반볼 설정 시, 다음 윤년에만 이벤트가 생성된다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 1, endDate: '2029-12-31' },
      };

      const results = createRepeatEvents(event);

      expect(results.map((event) => event.date)).toEqual(['2024-02-29', '2028-02-29']);
    });
  });

  describe('엣지 케이스', () => {
    it('종료일이 없는 경우 기본 최대 날짜까지만 이벤트가 생성된다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'monthly', interval: 1, endDate: undefined },
      };

      const results = createRepeatEvents(event);
      const lastEvent = results[results.length - 1];

      const DEFAULT_MAX_DATE = new Date('2025-06-30');

      expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(
        new Date(DEFAULT_MAX_DATE).getTime()
      );
    });

    it('유효하지 않은 반복 타입이 입력된 경우, 단일 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'invalid' as any, interval: 1, endDate: '2024-12-31' },
      };

      const results = createRepeatEvents(event);

      expect(results).toHaveLength(1);
    });
  });
});
