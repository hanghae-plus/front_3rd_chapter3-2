import { VStack, Heading, Table, Thead, Tr, Th, Tbody } from '@chakra-ui/react';
import React from 'react';

import { useCombinedContext } from '../../../provider';
import { formatMonth, formatWeek } from '../../../utils/dateUtils';
import { WEEK_DAYS } from '../@contant';

type Props = {
  children: React.ReactNode;
};

export function CalendarContainer({ children }: Props) {
  const { currentDate, view } = useCombinedContext();

  const testId = view === 'month' ? 'month-view' : 'week-view';

  const title = view === 'month' ? formatMonth(currentDate) : formatWeek(currentDate);

  return (
    <VStack data-testid={testId} align="stretch" w="full" spacing={4}>
      <Heading size="md">{title}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {WEEK_DAYS.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </VStack>
  );
}
