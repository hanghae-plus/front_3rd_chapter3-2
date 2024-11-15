import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { Event } from '../types';
import { EventListView } from './EventListView';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

interface MonthViewProps {
  currentDate: Date;
  holidays: { [key: string]: string };
  filteredEvents: Event[];
  filteredRepeats: Event[];
  notifiedEvents: string[];
}

export const MonthView = ({
  currentDate,
  holidays,
  filteredEvents,
  filteredRepeats,
  notifiedEvents,
}: MonthViewProps) => {
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
                        {getEventsForDay(filteredEvents, day).map((event) => {
                          return (
                            <EventListView
                              event={event}
                              notifiedEvents={notifiedEvents}
                              type="main"
                              key={event.id}
                            />
                          );
                        })}
                        {getEventsForDay(filteredRepeats, day).map((event) => {
                          return (
                            <EventListView
                              event={event}
                              notifiedEvents={notifiedEvents}
                              type="repeat"
                              key={event.id}
                            />
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
