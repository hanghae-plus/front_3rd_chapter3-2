import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/type.ts';
import CalendarMonthView from '../../../widgets/calendar/ui/CalendarMonthView.tsx';
import CalendarWeekView from '../../../widgets/calendar/ui/CalendarWeekView.tsx';
import { useCalendarView } from '../model/useCalendarView.ts';

interface CalendarViewProps {
  events: Event[];
}

const CalendarView = ({ events }: CalendarViewProps) => {
  const { view, setView, navigate } = useCalendarView();

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

      {view === 'week' && <CalendarWeekView events={events} />}
      {view === 'month' && <CalendarMonthView events={events} />}
    </VStack>
  );
};

export default CalendarView;
