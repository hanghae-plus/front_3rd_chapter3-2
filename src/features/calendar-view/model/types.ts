import { Event } from '../../../entities/event/model/types';

interface NotifiedEventsState {
  [key: string]: number;
}

export interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  holidays: Record<string, string>;
  notifiedEvents: NotifiedEventsState;
}

export interface DayCellProps {
  day: number | null;
  dateString: string;
  holiday: string | undefined;
  events: Event[];
  notifiedEvents: NotifiedEventsState;
}

export interface EventItemProps {
  event: Event;
  isNotified: boolean;
}
