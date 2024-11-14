import { Event } from '../../types';
import { getNextDate, getRepeatEvents } from '../../utils/repeat';

describe('반복 일정 유틸리티 함수 테스트', () => {
  const baseEvent: Event = {
    id: '1',
    title: '반복 일정',
    date: '2024-11-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트',
    location: '회의실',
    category: '업무',
    notificationTime: 10,
    repeat: {
      type: 'none',
      interval: 1,
      endDate: '2024-12-31',
    },
  };

  describe('getNextDate 함수', () => {
    it('매일 반복되는 일정의 다음 날짜를 계산한다', () => {
      const dailyEvent = {
        ...baseEvent,
        repeat: { ...baseEvent.repeat, type: 'daily', interval: 2 },
      } as Event;
      const result = getNextDate(dailyEvent, new Date('2024-11-15'));
      expect(result).toEqual(new Date('2024-11-17'));
    });

    it('매주 반복되는 일정의 다음 날짜를 계산한다', () => {
      const weeklyEvent = {
        ...baseEvent,
        repeat: { ...baseEvent.repeat, type: 'weekly', interval: 1 },
      } as Event;
      const result = getNextDate(weeklyEvent, new Date('2024-11-15'));
      expect(result).toEqual(new Date('2024-11-22'));
    });

    it('매월 마지막 날의 반복 일정을 처리한다', () => {
      const monthlyEvent = {
        ...baseEvent,
        date: '2024-11-30',
        repeat: { ...baseEvent.repeat, type: 'monthly', interval: 1 },
      } as Event;
      const result = getNextDate(monthlyEvent, new Date('2024-11-30'));
      expect(result).toEqual(new Date('2024-12-30'));
    });

    it('윤년의 2월 29일 반복 일정을 처리한다', () => {
      const yearlyEvent = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: { ...baseEvent.repeat, type: 'yearly', interval: 1 },
      } as Event;
      const result = getNextDate(yearlyEvent, new Date('2024-02-29'));
      expect(result).toEqual(new Date('2028-02-29'));
    });
  });

  describe('getRepeatEvents 함수', () => {
    it('종료일까지의 모든 반복 일정을 생성한다', () => {
      const weeklyEvent = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-12-15',
        },
      } as Event;
      const events = getRepeatEvents(weeklyEvent);
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2024-11-15');
      expect(events[4].date).toBe('2024-12-13');
    });

    it('종료일이 없는 경우 기본 종료일까지 일정을 생성한다', () => {
      const dailyEvent = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '',
        },
      } as Event;
      const events = getRepeatEvents(dailyEvent);
      expect(events.length).toBeGreaterThan(0);
      expect(new Date(events[events.length - 1].date).getFullYear()).toBe(2025);
    });

    it('반복 유형이 none인 경우 단일 일정만 반환한다', () => {
      const nonRepeatEvent = {
        ...baseEvent,
        repeat: { type: 'none', interval: 0, endDate: '' },
      } as Event;
      const events = getRepeatEvents(nonRepeatEvent);
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2024-11-15');
    });
  });
});
