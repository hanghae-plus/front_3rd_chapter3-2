import { useCalendarView } from '@hooks/useCalendarView';
import { MonthView } from '@templates/MonthView';
import { WeekView } from '@templates/WeekView';
import React from 'react';

export const Calendar: React.FC = () => {
  const { view, currentDate, holidays } = useCalendarView();
  return (
    <>
      {view === 'week' && <WeekView currentDate={currentDate} />}
      {view === 'month' && <MonthView currentDate={currentDate} holidays={holidays} />}
    </>
  );
};
