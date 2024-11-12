import { Event } from '../../../entities/event/model/types';

export interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  holidays: Record<string, string>;
  notifiedEvents: string[];
}

export interface DayCellProps {
  day: number | null;
  dateString: string;
  holiday: string | undefined;
  events: Event[];
  notifiedEvents: string[];
}

export interface EventItemProps {
  event: Event;
  isNotified: boolean;
}
