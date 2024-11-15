import React, { createContext } from 'react';

import { CalendarDirection_t, CalendarView_t, useCalendarView } from '../hooks/useCalendarView';

// ! 캘린더 뷰 훅 컨텍스트
export interface CalendarViewHookContextType {
  view: CalendarView_t;
  currentDate: Date;
  holidays: { [key: string]: string };
  // eslint-disable-next-line no-unused-vars
  setView: (view: CalendarView_t) => void;
  // eslint-disable-next-line no-unused-vars
  navigate: (direction: CalendarDirection_t) => void;
}

export const CalendarViewHookContext = createContext<CalendarViewHookContextType | null>(null);

// ! 캘린더 뷰 훅 프로바이더
export function CalendarViewHookProvider({ children }: { children: React.ReactNode }) {
  const calendarView = useCalendarView();

  return (
    <CalendarViewHookContext.Provider
      value={{
        view: calendarView.view,
        currentDate: calendarView.currentDate,
        holidays: calendarView.holidays,
        setView: calendarView.setView,
        navigate: calendarView.navigate,
      }}
    >
      {children}
    </CalendarViewHookContext.Provider>
  );
}
