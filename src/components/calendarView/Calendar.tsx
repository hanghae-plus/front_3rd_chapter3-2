import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';

export const Calendar = () => {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { notifiedEvents } = useNotifications(events);
  const { filteredEvents } = useSearch(events, currentDate, view);

  return (
    <VStack flex={1} spacing={5} align="stretch">
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
          holidays={holidays}
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
