import { EventForm } from '@entities/event/model/types';
import {
  createRepeatedEvent,
  generateRepeatedEvents,
  calculateNextDate,
} from '@features/event/model/utils';

describe('반복 이벤트 유틸리티', () => {
  const baseEvent: EventForm = {
    title: '테스트 이벤트',
    date: '2024-01-01',
    startTime: '10:00',
    endTime: '11:00',
    location: '회의실',
    description: '테스트 설명',
    category: 'default',
    notificationTime: 10,
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-01-05',
    },
  };

  describe('createRepeatedEvent', () => {
    it('기존 이벤트를 기반으로 새로운 날짜의 이벤트를 생성한다', () => {
      const newDate = new Date('2024-01-02');
      const result = createRepeatedEvent(baseEvent, newDate);

      expect(result).toEqual({
        ...baseEvent,
        date: '2024-01-02',
      });
    });
  });

  describe('generateRepeatedEvents', () => {
    it('종료일이 없는 경우 기본 이벤트만 반환한다', () => {
      const eventWithoutEndDate: EventForm = {
        ...baseEvent,
        repeat: {
          ...baseEvent.repeat,
          endDate: '',
        },
      };

      const result = generateRepeatedEvents(eventWithoutEndDate);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(eventWithoutEndDate);
    });

    it('일간 반복 이벤트를 생성한다', () => {
      const result = generateRepeatedEvents(baseEvent);

      expect(result).toHaveLength(5); // 1/1 ~ 1/5까지 5개
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
      expect(result[2].date).toBe('2024-01-03');
      expect(result[3].date).toBe('2024-01-04');
      expect(result[4].date).toBe('2024-01-05');
    });

    it('주간 반복 이벤트를 생성한다', () => {
      const weeklyEvent: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-01-22',
        },
      };

      const result = generateRepeatedEvents(weeklyEvent);

      expect(result).toHaveLength(4); // 1/1, 1/8, 1/15, 1/22
      expect(result.map((event) => event.date)).toEqual([
        '2024-01-01',
        '2024-01-08',
        '2024-01-15',
        '2024-01-22',
      ]);
    });

    it('월간 반복 이벤트를 생성한다', () => {
      const monthlyEvent: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-03-01',
        },
      };

      const result = generateRepeatedEvents(monthlyEvent);

      expect(result).toHaveLength(3); // 1/1, 2/1, 3/1
      expect(result.map((event) => event.date)).toEqual(['2024-01-01', '2024-02-01', '2024-03-01']);
    });

    it('연간 반복 이벤트를 생성한다', () => {
      const yearlyEvent: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2026-01-01',
        },
      };

      const result = generateRepeatedEvents(yearlyEvent);

      expect(result).toHaveLength(3); // 2024/1/1, 2025/1/1, 2026/1/1
      expect(result.map((event) => event.date)).toEqual(['2024-01-01', '2025-01-01', '2026-01-01']);
    });

    it('반복 간격을 고려하여 이벤트를 생성한다', () => {
      const eventWithInterval: EventForm = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 2, // 2일 간격
          endDate: '2024-01-05',
        },
      };

      const result = generateRepeatedEvents(eventWithInterval);

      expect(result).toHaveLength(3); // 1/1, 1/3, 1/5
      expect(result.map((event) => event.date)).toEqual(['2024-01-01', '2024-01-03', '2024-01-05']);
    });
  });

  describe('calculateNextDate', () => {
    const baseDate = new Date('2024-01-01');

    it('일간 다음 날짜를 계산한다', () => {
      const result = calculateNextDate(baseDate, 'daily', 1);
      expect(result).toEqual(new Date('2024-01-02'));
    });

    it('주간 다음 날짜를 계산한다', () => {
      const result = calculateNextDate(baseDate, 'weekly', 1);
      expect(result).toEqual(new Date('2024-01-08'));
    });

    it('월간 다음 날짜를 계산한다', () => {
      const result = calculateNextDate(baseDate, 'monthly', 1);
      expect(result).toEqual(new Date('2024-02-01'));
    });

    it('연간 다음 날짜를 계산한다', () => {
      const result = calculateNextDate(baseDate, 'yearly', 1);
      expect(result).toEqual(new Date('2025-01-01'));
    });

    it('잘못된 반복 타입인 경우 null을 반환한다', () => {
      const result = calculateNextDate(baseDate, 'invalid', 1);
      expect(result).toBeNull();
    });

    it('간격을 고려하여 다음 날짜를 계산한다', () => {
      const result = calculateNextDate(baseDate, 'daily', 2);
      expect(result).toEqual(new Date('2024-01-03'));
    });
  });
});
