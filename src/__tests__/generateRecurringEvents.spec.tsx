import { expect } from 'vitest';

import { RepeatType } from '../types.ts';
import { generateRecurringEvents } from '../utils/eventUtils.ts';

describe('generateRecurringEvents', () => {
  it('매일 반복: 간격 1, 시작 날짜와 종료 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 1, 'daily' as RepeatType, '2024-01-05');
    expect(result).toEqual(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']);
  });

  it('매주 반복: 간격 1, 시작 날짜와 종료 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 1, 'weekly' as RepeatType, '2024-01-29');
    expect(result).toEqual(['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29']);
  });

  it('매월 반복: 간격 1, 시작 날짜와 종료 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 1, 'monthly' as RepeatType, '2024-06-01');
    expect(result).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
      '2024-04-01',
      '2024-05-01',
      '2024-06-01',
    ]);
  });

  it('매년 반복: 간격 1, 시작 날짜와 종료 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 1, 'yearly' as RepeatType, '2028-01-01');
    expect(result).toEqual(['2024-01-01', '2025-01-01', '2026-01-01', '2027-01-01', '2028-01-01']);
  });

  it('매일 반복: 간격 2, 종료 날짜 초과 이전까지 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 2, 'daily' as RepeatType, '2024-01-10');
    expect(result).toEqual(['2024-01-01', '2024-01-03', '2024-01-05', '2024-01-07', '2024-01-09']);
  });

  it('매월 반복: 간격 3, 종료 날짜 초과 이전까지 날짜 포함', () => {
    const result = generateRecurringEvents('2024-01-01', 3, 'monthly' as RepeatType, '2024-12-01');
    expect(result).toEqual(['2024-01-01', '2024-04-01', '2024-07-01', '2024-10-01']);
  });

  it('종료 날짜 이전까지 정확하게 반복 일정이 생성되는지 확인', () => {
    const result = generateRecurringEvents('2024-01-01', 1, 'weekly' as RepeatType, '2024-01-15');
    expect(result).toEqual(['2024-01-01', '2024-01-08', '2024-01-15']);
  });
});
