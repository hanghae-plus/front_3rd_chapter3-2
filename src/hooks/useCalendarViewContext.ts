import { useContext } from 'react';

import {
  CalendarViewHookContext,
  CalendarViewHookContextType,
} from '../providers/CalendarViewHookProvider';

export const useCalendarViewContext = (): CalendarViewHookContextType => {
  const context = useContext(CalendarViewHookContext);
  if (!context) {
    throw new Error('useCalendarViewContext must be used within an CalendarViewHookProvider');
  }
  return context;
};
