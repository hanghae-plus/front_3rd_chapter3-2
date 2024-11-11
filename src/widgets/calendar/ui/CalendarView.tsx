import { Heading, VStack } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { CalenderController } from '@features/calendar/ui';
import { MonthView } from '@features/calendar/ui/MonthView';
import { WeekView } from '@features/calendar/ui/WeekView';

interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  filteredEvents: Event[];
  holidays: { [key: string]: string };
  notifiedEvents: string[];
}

export const CalendarView = ({
  view,
  setView,
  navigate,
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
}: CalendarViewProps) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <CalenderController view={view} setView={setView} navigate={navigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
    </VStack>
  );
};
