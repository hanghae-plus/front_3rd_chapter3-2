import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import { fetchHolidays } from '../apis/fetchHolidays';

const viewAtom = atom<'week' | 'month'>('month');
const currentDateAtom = atom(new Date());
const holidaysAtom = atom<{ [key: string]: string }>({});

export const useCalendarView = () => {
  const [view, setView] = useAtom(viewAtom);
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const [holidays, setHolidays] = useAtom(holidaysAtom);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      } else if (view === 'month') {
        newDate.setDate(1); // 항상 1일로 설정
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  useEffect(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate, setHolidays]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
