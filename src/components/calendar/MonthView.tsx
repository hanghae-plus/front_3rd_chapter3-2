import { VStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../../utils/dateUtils';

export function MonthView() {
  const { currentDate, holidays } = useCalendarView();
  const { events } = useEventOperations(false);
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table>
        <Thead>
          <Tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <Th key={day}>{day}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {weeks.map((week, weekIndex) => (
            <Tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateString = day ? formatDate(currentDate, day) : '';
                const holiday = holidays[dateString];
                return (
                  <Td key={`${weekIndex}-${dayIndex}`} height="100px" verticalAlign="top">
                    {day && (
                      <>
                        <Text>{day}</Text>
                        {holiday && <Text color="red.500">{holiday.replace('.', '')}</Text>}
                        {getEventsForDay(events, day).map((event) => (
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
                      </>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
}
