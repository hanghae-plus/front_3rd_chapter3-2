import { BellIcon } from '@chakra-ui/icons';
import { Box, Heading, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';

import { getEventsForDay, getWeeksAtMonth } from '../../../entities/calendar/lib/calendarUtils';
import { Event } from '../../../entities/event/model/types';
import { weekDays } from '../../../shared/config/constant';
import { formatDate, formatMonth } from '../../../shared/lib/date';
import { HStack, VStack } from '../../../shared/ui/Stack';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  holidays: Record<string, string>;
  notifiedEvents: string[];
}

export const MonthView = ({ currentDate, events, holidays, notifiedEvents }: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {weekDays.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
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
                  <Td
                    key={dayIndex}
                    height="100px"
                    verticalAlign="top"
                    width="14.28%"
                    position="relative"
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(events, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          return (
                            <Box
                              key={event.id}
                              p={1}
                              my={1}
                              bg={isNotified ? 'red.100' : 'gray.100'}
                              borderRadius="md"
                              fontWeight={isNotified ? 'bold' : 'normal'}
                              color={isNotified ? 'red.500' : 'inherit'}
                            >
                              <HStack spacing={1}>
                                {isNotified && <BellIcon />}
                                {event.repeat?.type !== 'none' && (
                                  <Text fontSize="xs" color="gray.500">
                                    {event.repeat?.type === 'daily' && '매일'}
                                    {event.repeat?.type === 'weekly' && '매주'}
                                    {event.repeat?.type === 'monthly' && '매월'}
                                    {event.repeat?.type === 'yearly' && '매년'}
                                  </Text>
                                )}
                                <Text fontSize="sm" noOfLines={1}>
                                  {event.title}
                                </Text>
                              </HStack>
                            </Box>
                          );
                        })}
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
};
