import { VStack } from '@chakra-ui/react';

import { CalendarContainer, CalendarHeader, ViewMonth, ViewWeek } from './@components';
import { useCombinedContext } from '../../provider';

export function Calendar() {
  const { view } = useCombinedContext();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <CalendarHeader />
      <CalendarContainer>{view === 'month' ? <ViewMonth /> : <ViewWeek />}</CalendarContainer>
    </VStack>
  );
}
