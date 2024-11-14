import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { EventCalendarItem } from './EventCalendarItem';
import { weekDays } from '../../constants/eventCalendar';
import { Holidays } from '../../hooks/useCalendarView';
import { Event, EventId } from '../../types';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../../utils/dateUtils';

type Props = {
  currentDate: Date;
  holidays: Holidays;

  filteredEvents: Event[];
  notifiedEvents: EventId[];
};

export const MonthView = ({ currentDate, filteredEvents, notifiedEvents, holidays }: Props) => {
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
                    data-testid={`day-${day}`}
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(filteredEvents, day).map((event) => (
                          <EventCalendarItem
                            key={event.id}
                            isNotified={notifiedEvents.includes(event.id)}
                            event={event}
                          />
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
};
