import { VStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { formatDate, formatWeek, getEventsForDay, getWeekDates } from '../../utils/dateUtils';

export function WeekView() {
  const { currentDate, holidays } = useCalendarView();
  const { events } = useEventOperations(false);
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table>
        <Thead>
          <Tr>
            {weekDates.map((date) => (
              <Th key={date.toISOString()}>{formatDate(date)}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            {weekDates.map((date) => {
              const dayEvents = getEventsForDay(events, date.getDate());
              const dateString = formatDate(date);
              const holiday = holidays[dateString];
              return (
                <Td key={date.toISOString()} height="150px" verticalAlign="top">
                  {holiday && <Text color="red.500">{holiday.replace('.', '')}</Text>}
                  {dayEvents.map((event) => (
                    <Text
                      key={event.id}
                      fontSize="sm"
                      noOfLines={1}
                      bg="gray.100"
                      p={1}
                      my={1}
                      borderRadius="sm"
                    >
                      {event.title}
                    </Text>
                  ))}
                </Td>
              );
            })}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
}
