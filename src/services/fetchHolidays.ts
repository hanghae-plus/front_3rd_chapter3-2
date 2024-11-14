import { HOLIDAY_RECORD } from '@constants/days';
import { fillZero } from '@utils/dateUtils';

type HolidayRecord = typeof HOLIDAY_RECORD;
type HolidayKeys = keyof HolidayRecord;

export function fetchHolidays(date: Date) {
  const y = date.getFullYear();
  const m = fillZero(date.getMonth() + 1);
  const holidays = Object.keys(HOLIDAY_RECORD) as HolidayKeys[];
  return holidays
    .filter((date) => date.includes(`${y}-${m}`))
    .reduce(
      (acc: Partial<HolidayRecord>, date) => ({
        ...acc,
        [date]: HOLIDAY_RECORD[date],
      }),
      {}
    );
}
