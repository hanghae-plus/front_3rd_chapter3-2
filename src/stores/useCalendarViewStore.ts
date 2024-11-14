import { getDateWithOffset } from '@utils/dateUtils';
import { create } from 'zustand';

interface CalendarView {
  view: 'week' | 'month';
  setView: (v: 'week' | 'month') => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  holidays: { [key: string]: string };
  setHolidays: (v: { [key: string]: string }) => void;

  navigate: (v: 'next' | 'prev') => void;
}

const useCalendarViewStore = create<CalendarView>((set) => ({
  view: 'month',
  setView: (v: 'week' | 'month') => set(() => ({ view: v })),

  currentDate: new Date(),
  setCurrentDate: (date: Date) => set(() => ({ currentDate: date })),

  holidays: {},
  setHolidays: (newHolidays: { [key: string]: string }) =>
    set(() => ({ holidays: { ...newHolidays } })),

  navigate: (direction: 'next' | 'prev') =>
    set((state) => {
      const newDate = new Date(state.currentDate);
      const offset = direction === 'next' ? 1 : -1;
      if (state.view === 'week') {
        const calcDate = getDateWithOffset(newDate, 7 * offset);
        return { currentDate: calcDate };
      } else {
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + 1 * offset);
        return { currentDate: newDate };
      }
    }),

  reset: () =>
    set(() => ({
      view: 'month',
      currentDate: new Date(),
      holidays: {},
    })),
}));
export default useCalendarViewStore;
