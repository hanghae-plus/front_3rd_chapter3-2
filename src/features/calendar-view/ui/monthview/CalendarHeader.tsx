import { Th, Tr } from '@chakra-ui/react';
import { memo } from 'react';

import { weekDays } from '../../../../shared/config/constant';

export const CalendarHeader = memo(() => {
  return (
    <Tr>
      {weekDays.map((day) => (
        <Th key={day} width="14.28%" textAlign="center" py={4} color="gray.600">
          {day}
        </Th>
      ))}
    </Tr>
  );
});

CalendarHeader.displayName = 'CalendarHeader';
