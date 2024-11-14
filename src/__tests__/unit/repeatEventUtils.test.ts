import { RepeatInfo } from '../../types';
import { generateRepeatEventDates } from '../../utils/repeatEventUtils';

describe('generateRepeatEventDates', () => {
  it('주간 반복 일정의 날짜들을 생성한다', () => {
    const baseDate = '2024-10-15';
    const repeat = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-10-29',
    } as RepeatInfo;

    const dates = generateRepeatEventDates(baseDate, repeat);

    expect(dates).toEqual(['2024-10-15', '2024-10-22', '2024-10-29']);
  });

  it('격주 반복 일정을 생성한다', () => {
    const baseDate = '2024-11-01';
    const repeat: RepeatInfo = {
      type: 'weekly',
      interval: 2,
      endDate: '2024-11-29',
    };
    expect(generateRepeatEventDates(baseDate, repeat)).toEqual([
      '2024-11-01',
      '2024-11-15',
      '2024-11-29',
    ]);
  });

  it('일간 반복 일정을 생성한다', () => {
    const baseDate = '2024-11-01';
    const repeat: RepeatInfo = {
      type: 'daily',
      interval: 1,
      endDate: '2024-11-05',
    };
    expect(generateRepeatEventDates(baseDate, repeat)).toEqual([
      '2024-11-01',
      '2024-11-02',
      '2024-11-03',
      '2024-11-04',
      '2024-11-05',
    ]);
  });

  it('월간 반복 일정을 생성한다', () => {
    const baseDate = '2024-11-01';
    const repeat: RepeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2025-02-28',
    };

    expect(generateRepeatEventDates(baseDate, repeat)).toEqual([
      '2024-11-01',
      '2024-12-01',
      '2025-01-01',
      '2025-02-01',
    ]);
  });

  it('endDate가 없는 경우 2025-06-30을 기본 종료일로 사용한다', () => {
    const baseDate = '2025-04-01';
    const repeat: RepeatInfo = {
      type: 'monthly',
      interval: 1,
    };

    expect(generateRepeatEventDates(baseDate, repeat)).toEqual([
      '2025-04-01',
      '2025-05-01',
      '2025-06-01',
    ]);
  });

  it('연간 반복 일정을 생성한다', () => {
    const baseDate = '2023-11-01';
    const repeat: RepeatInfo = {
      type: 'yearly',
      interval: 1,
      endDate: '2025-06-30',
    };

    expect(generateRepeatEventDates(baseDate, repeat)).toEqual(['2023-11-01', '2024-11-01']);
  });

  it('윤년 2월 29일을 포함하는 2020-02-29의 경우, 윤년은 29일, 평년은 28일로 처리한다', () => {
    const baseDate = '2020-02-29';
    const repeat: RepeatInfo = {
      type: 'yearly',
      interval: 1,
    };

    expect(generateRepeatEventDates(baseDate, repeat)).toEqual([
      '2020-02-29',
      '2021-02-28',
      '2022-02-28',
      '2023-02-28',
      '2024-02-29',
      '2025-02-28',
    ]);
  });

  it('반복 일정이 없는 경우 기본 일정을 반환한다', () => {
    const baseDate = '2024-11-01';
    const repeat: RepeatInfo = {
      type: 'none',
      interval: 0,
    };

    expect(generateRepeatEventDates(baseDate, repeat)).toEqual(['2024-11-01']);
  });
});
