import { fetchHolidays } from '@shared/api';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const testDate = new Date('2024-05-01');
    const holidays = fetchHolidays(testDate);
    expect(Object.keys(holidays)).toHaveLength(1);
    expect(holidays['2024-05-05']).toBe('어린이날');
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const testDate = new Date('2024-04-01');
    const holidays = fetchHolidays(testDate);
    expect(Object.keys(holidays)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const testDate = new Date('2024-09-01');
    const holidays = fetchHolidays(testDate);
    const sortedDates = Object.keys(holidays).sort();
    expect(sortedDates).toHaveLength(3);
    expect(sortedDates).toEqual(['2024-09-16', '2024-09-17', '2024-09-18']);
    expect(holidays['2024-09-16']).toBe('추석');
    expect(holidays['2024-09-17']).toBe('추석');
    expect(holidays['2024-09-18']).toBe('추석');
  });
});
