import { expect } from 'vitest';
import { RepeatType } from '../../types';
import { createRepeatEvent } from '../../utils/createRepeatEvent';

describe('createRepeatEvent', () => {
  it('반복 날짜가 1일마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 1, 'daily' as RepeatType, '2024-11-05');
    expect(result).toEqual(['2024-11-01', '2024-11-02', '2024-11-03', '2024-11-04', '2024-11-05']);
  });

  it('반복 날짜가 1주마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 1, 'weekly' as RepeatType, '2024-11-29');
    expect(result).toEqual(['2024-11-01', '2024-11-08', '2024-11-15', '2024-11-22', '2024-11-29']);
  });

  it('반복 날짜가 1개월마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 1, 'monthly' as RepeatType, '2025-04-01');
    expect(result).toEqual([
      '2024-11-01',
      '2024-12-01',
      '2025-01-01',
      '2025-02-01',
      '2025-03-01',
      '2025-04-01',
    ]);
  });

  it('반복 날짜가 1년마다 반복되어야 하고, 입력한 시작 날짜와 종료 날짜를 모두 포함해야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 1, 'yearly' as RepeatType, '2028-11-01');
    expect(result).toEqual(['2024-11-01', '2025-11-01', '2026-11-01', '2027-11-01', '2028-11-01']);
  });

  it('반복 날짜가 2일마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 2, 'daily' as RepeatType, '2024-11-10');
    expect(result).toEqual(['2024-11-01', '2024-11-03', '2024-11-05', '2024-11-07', '2024-11-09']);
  });

  it('반복 날짜가 3주마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 3, 'weekly' as RepeatType, '2025-01-31');
    expect(result).toEqual(['2024-11-01', '2024-11-22', '2024-12-13', '2025-01-03', '2025-01-24']);
  });

  it('반복 날짜가 3개월마다 반복되어야 하고, 종료 날짜를 초과하지 않는 범위 내에서 반복되어야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 3, 'monthly' as RepeatType, '2025-11-01');
    expect(result).toEqual(['2024-11-01', '2025-02-01', '2025-05-01', '2025-08-01', '2025-11-01']);
  });

  it('반복 일정이 종료 날짜 이전까지 정확하게 생성되어야 한다.', () => {
    const result = createRepeatEvent('2024-11-01', 1, 'weekly' as RepeatType, '2024-11-15');
    expect(result).toEqual(['2024-11-01', '2024-11-08', '2024-11-15']);
  });
});