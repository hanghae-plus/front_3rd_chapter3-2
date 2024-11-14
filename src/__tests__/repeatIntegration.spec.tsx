import { eventFactory } from '@/__mocks__/Factory';
import {
  getEventsForDay,
  isDailyInRange,
  isMonthlyInRange,
  isWeeklyInRange,
  isYearlyInRange,
} from '@/utils/dateUtils';

describe('연,달,주,일을 기준으로 해당 일정 조건과 같으면 true를 반환한다', () => {
  it('isYearlyInRange > 반복 간격과 종료 날짜의 조건에 맞을 경우에만 true를 반환한다.', async () => {
    const MOCK_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'yearly', interval: 2, endDate: '2026-10-01' },
    });

    expect(isYearlyInRange(MOCK_EVENT, '2024-10-01')).toBe(true);
    expect(isYearlyInRange(MOCK_EVENT, '2025-10-01')).toBe(false);
    expect(isYearlyInRange(MOCK_EVENT, '2026-10-01')).toBe(true);
    expect(isYearlyInRange(MOCK_EVENT, '2027-10-01')).toBe(false);
    expect(isYearlyInRange(MOCK_EVENT, '2028-10-01')).toBe(false);
  });

  it('isMonthlyInRange > 반복 간격과 종료 날짜의 조건에 맞을 경우에만 true를 반환한다.', async () => {
    const MOCK_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'monthly', interval: 2, endDate: '2025-02-01' },
    });

    expect(isMonthlyInRange(MOCK_EVENT, '2024-10-01')).toBe(true);
    expect(isMonthlyInRange(MOCK_EVENT, '2024-11-01')).toBe(false);
    expect(isMonthlyInRange(MOCK_EVENT, '2024-12-01')).toBe(true);
    expect(isMonthlyInRange(MOCK_EVENT, '2025-01-01')).toBe(false);
    expect(isMonthlyInRange(MOCK_EVENT, '2025-02-01')).toBe(true);
    expect(isMonthlyInRange(MOCK_EVENT, '2025-03-01')).toBe(false);
    expect(isMonthlyInRange(MOCK_EVENT, '2025-04-01')).toBe(false);
  });

  it('isWeeklyInRange > 반복 간격과 종료 날짜의 조건에 맞을 경우에만 true를 반환한다.', async () => {
    const MOCK_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'weekly', interval: 2, endDate: '2024-10-15' },
    });

    expect(isWeeklyInRange(MOCK_EVENT, '2024-10-01')).toBe(true);
    expect(isWeeklyInRange(MOCK_EVENT, '2024-10-08')).toBe(false);
    expect(isWeeklyInRange(MOCK_EVENT, '2024-10-15')).toBe(true);
    expect(isWeeklyInRange(MOCK_EVENT, '2024-10-22')).toBe(false);
    expect(isWeeklyInRange(MOCK_EVENT, '2024-10-29')).toBe(false);
  });

  it('isDailyInRange > 반복 간격과 종료 날짜의 조건에 맞을 경우에만 true를 반환한다.', async () => {
    const MOCK_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'daily', interval: 2, endDate: '2024-10-03' },
    });

    expect(isDailyInRange(MOCK_EVENT, '2024-10-01')).toBe(true);
    expect(isDailyInRange(MOCK_EVENT, '2024-10-02')).toBe(false);
    expect(isDailyInRange(MOCK_EVENT, '2024-10-03')).toBe(true);
    expect(isDailyInRange(MOCK_EVENT, '2024-10-04')).toBe(false);
    expect(isDailyInRange(MOCK_EVENT, '2024-10-05')).toBe(false);
  });
});

describe('getEventsForDay > 조건에 맞는 일정만 반환한다.', () => {
  it('반복 간격과 종료 날짜의 조건에 맞을 경우에만 true를 반환한다.', async () => {
    const YEAR_REAT_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'yearly', interval: 1, endDate: '2026-10-01' },
    });
    const MONTH_REAT_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'monthly', interval: 1, endDate: '2026-10-01' },
    });
    const WEEK_REAT_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'weekly', interval: 1, endDate: '2026-10-01' },
    });
    const DAY_REAT_EVENT = eventFactory.build({
      date: '2024-10-01',
      repeat: { type: 'daily', interval: 1, endDate: '2026-10-01' },
    });

    const MOCK_EVENTS = [YEAR_REAT_EVENT, MONTH_REAT_EVENT, WEEK_REAT_EVENT, DAY_REAT_EVENT];

    expect(getEventsForDay(MOCK_EVENTS, '2024-10-01')).toEqual(MOCK_EVENTS);
    expect(getEventsForDay(MOCK_EVENTS, '2024-10-03')).toEqual([DAY_REAT_EVENT]);
    expect(getEventsForDay(MOCK_EVENTS, '2024-10-08')).toEqual([WEEK_REAT_EVENT, DAY_REAT_EVENT]);
    expect(getEventsForDay(MOCK_EVENTS, '2024-11-01')).toEqual([MONTH_REAT_EVENT, DAY_REAT_EVENT]);
    expect(getEventsForDay(MOCK_EVENTS, '2025-10-01')).toEqual([
      YEAR_REAT_EVENT,
      MONTH_REAT_EVENT,
      DAY_REAT_EVENT,
    ]);
  });
});
