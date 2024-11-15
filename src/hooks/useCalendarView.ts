import { useEffect, useState } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';

export const CalendarView_e = {
  Week: 'week',
  Month: 'month',
} as const;
export type CalendarView_t = (typeof CalendarView_e)[keyof typeof CalendarView_e];

export const CalendarDirection_e = {
  Prev: 'prev',
  Next: 'next',
} as const;
export type CalendarDirection_t = (typeof CalendarDirection_e)[keyof typeof CalendarDirection_e];

export const useCalendarView = () => {
  const [view, setView] = useState<CalendarView_t>(CalendarView_e.Month);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

  const navigate = (direction: CalendarDirection_t) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === CalendarView_e.Week) {
        newDate.setDate(newDate.getDate() + (direction === CalendarDirection_e.Next ? 7 : -7));
      } else if (view === CalendarView_e.Month) {
        newDate.setDate(1); // 항상 1일로 설정
        newDate.setMonth(newDate.getMonth() + (direction === CalendarDirection_e.Next ? 1 : -1));
      }
      return newDate;
    });
  };

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
