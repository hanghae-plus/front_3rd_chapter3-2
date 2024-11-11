import { VStack, Heading } from '@chakra-ui/react';

import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { useCalendarView } from '../../hooks/useCalendarView';

export function Calendar() {
  const { view } = useCalendarView();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      <CalendarHeader />
      {view === 'week' && <WeekView />}
      {view === 'month' && <MonthView />}
    </VStack>
  );
}
