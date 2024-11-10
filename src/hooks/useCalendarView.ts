import { fetchHolidays } from '@services/fetchHolidays';
import useCalendarViewStore from '@stores/useCalendarViewStore';
import { useCallback, useEffect } from 'react';

export const useCalendarView = () => {
  const view = useCalendarViewStore((state) => state.view);
  const setView = useCalendarViewStore((state) => state.setView);
  const setCurrentDate = useCalendarViewStore((state) => state.setCurrentDate);
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const holidays = useCalendarViewStore((state) => state.holidays);
  const setHolidays = useCalendarViewStore((state) => state.setHolidays);

  const navigate = useCalendarViewStore((state) => state.navigate);

  useEffect(() => {
    setHolidays(fetchHolidays(currentDate));
  }, [currentDate, setHolidays]);

  return {
    view,
    setView: useCallback((view: 'week' | 'month') => setView(view), [setView]),
    currentDate,
    setCurrentDate: useCallback((date: Date) => setCurrentDate(date), [setCurrentDate]),
    holidays,
    navigate: useCallback((direction: 'prev' | 'next') => navigate(direction), [navigate]),
  };
};
