import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { useCalendarView } from '../../hooks/useCalendarView';
import { Event, EventId } from '../../types';

type Props = ReturnType<typeof useCalendarView> & {
  filteredEvents: Event[];
  notifiedEvents: EventId[];
};

export const Calendar = ({
  filteredEvents,
  notifiedEvents,

  currentDate,
  holidays,
  view,
  setView,
  navigate,
}: Props) => {
  return (
    <VStack flex={1} spacing={5} align="stretch" data-testid="calendar-view">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate('next')}
        />
      </HStack>

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
          filteredEvents={filteredEvents}
          holidays={holidays}
          notifiedEvents={notifiedEvents}
        />
      )}
    </VStack>
  );
};
