import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { IconButton, Select, VStack, HStack, Heading } from '@chakra-ui/react';

import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDirection_e, CalendarView_e, CalendarView_t } from '../../hooks/useCalendarView';
import { useCalendarViewContext } from '../../hooks/useCalendarViewContext';
import { Event } from '../../types';

type CalendarViewProps = {
  events: Event[];
};

export const CalendarView = ({ events }: CalendarViewProps) => {
  const { view, currentDate, holidays, setView, navigate } = useCalendarViewContext();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate(CalendarDirection_e.Prev)}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as CalendarView_t)}
        >
          <option value={CalendarView_e.Week}>Week</option>
          <option value={CalendarView_e.Month}>Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate(CalendarDirection_e.Next)}
        />
      </HStack>

      {view === CalendarView_e.Week && (
        <CalendarWeekView events={events} currentDate={currentDate} />
      )}
      {view === CalendarView_e.Month && (
        <CalendarMonthView events={events} currentDate={currentDate} holidays={holidays} />
      )}
    </VStack>
  );
};
