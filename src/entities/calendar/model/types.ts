export interface Holiday {
  date: string;
  name: string;
}

export interface CalendarDate {
  date: Date;
  events: Event[];
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
}
