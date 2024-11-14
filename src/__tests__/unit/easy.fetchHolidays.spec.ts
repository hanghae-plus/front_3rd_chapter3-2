import { fetchHolidays } from '@services/fetchHolidays';
import { fillZero } from '@utils/dateUtils';

const EXPECTED_HOLIDAYS = {
  '01': { '2024-01-01': '신정' },
  '02': {
    '2024-02-09': '설날',
    '2024-02-10': '설날',
    '2024-02-11': '설날',
  },
  '03': { '2024-03-01': '삼일절' },
  '04': {}, // 공휴일 없음
  '05': { '2024-05-05': '어린이날' },
  '06': { '2024-06-06': '현충일' },
  '07': {}, // 공휴일 없음
  '08': { '2024-08-15': '광복절' },
  '09': {
    '2024-09-16': '추석',
    '2024-09-17': '추석',
    '2024-09-18': '추석',
  },
  '10': {
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
  },
  '11': {}, // 공휴일 없음
  '12': { '2024-12-25': '크리스마스' },
} as { [key: string]: { [key: string]: string } };

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date(`2024-01-01`);
    const holidays = fetchHolidays(date);

    expect(holidays).toEqual({ '2024-01-01': '신정' });
  });

  test.each([4, 7, 11])('공휴일이 없는 월에 대해 빈 객체를 반환한다', (month) => {
    const date = new Date(`2024-${month}-01`);
    const holidays = fetchHolidays(date);
    expect(holidays).toEqual({});
  });

  test.each([1, 2, 3, 5, 6, 7, 8, 9, 10, 12])(
    '여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다',
    (month) => {
      const date = new Date(`2024-${month}-01`);
      const holidays = fetchHolidays(date);
      const formatMonth = String(fillZero(month));
      expect(holidays).toEqual(EXPECTED_HOLIDAYS[formatMonth]);
    }
  );
});
