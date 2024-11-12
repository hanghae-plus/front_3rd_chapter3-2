import { Heading, Table, Tbody, Thead } from '@chakra-ui/react';
import { memo } from 'react';

import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { getEventsForDay, getWeeksAtMonth } from '../../../../entities/calendar/lib/calendarUtils';
import { formatDate, formatMonth } from '../../../../shared/lib/date';
import { VStack } from '../../../../shared/ui/Stack';
import { MonthViewProps } from '../../model/types';

export const MonthView = memo(
  ({ currentDate, events, holidays, notifiedEvents }: MonthViewProps) => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
        <Heading size="md" color="blue.600" fontWeight="semibold">
          {formatMonth(currentDate)}
        </Heading>

        <Table
          variant="simple"
          w="full"
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Thead>
            <CalendarHeader />
          </Thead>
          <Tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const dayEvents = day ? getEventsForDay(events, day) : [];

                  return (
                    <DayCell
                      key={dayIndex}
                      day={day}
                      dateString={dateString}
                      holiday={holidays[dateString]}
                      events={dayEvents}
                      notifiedEvents={notifiedEvents}
                    />
                  );
                })}
              </tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    );
  }
);

MonthView.displayName = 'MonthView';
