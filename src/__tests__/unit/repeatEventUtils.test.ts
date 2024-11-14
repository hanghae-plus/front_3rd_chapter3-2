import { RepeatInfo } from '../../types';
import { generateRepeatEventDates } from '../../utils/repeatEventUtils';

describe('generateRepeatEventDates', () => {
  it('주간 반복 일정의 날짜들을 생성해야 한다', () => {
    const baseDate = '2024-10-15';
    const repeat = {
      type: 'weekly',
      interval: 1,
      endDate: '2024-10-29',
    } as RepeatInfo;

    const dates = generateRepeatEventDates(baseDate, repeat);

    expect(dates).toEqual(['2024-10-15', '2024-10-22', '2024-10-29']);
  });

  it('격주 반복 일정을 생성해야 한다', () => {
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
});
