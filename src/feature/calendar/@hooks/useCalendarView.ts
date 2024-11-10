/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import { fetchHolidays } from '../../../apis/fetchHolidays';

export type UseCalendarView = {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string[]> | {};
  navigate: (_direction: 'prev' | 'next') => void;
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const useCalendarView = (): UseCalendarView => {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({});

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
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate]);

  return { view, setView, currentDate, setCurrentDate, holidays, navigate };
};
