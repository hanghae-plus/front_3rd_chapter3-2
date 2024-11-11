import { Heading, Table, Tbody, Td, Text, Thead, Tr, VStack } from '@chakra-ui/react';

import { ScheduleDay } from './ScheduleDay';
import { WeekDaysTableColumnHeader } from './WeekDaysTableColumnHeader';
import { CALENDAR_TABLE_COLUMN_WIDTH } from '../../constants';
import { CalendarView_e } from '../../hooks/useCalendarView';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../../utils/dateUtils';

type CalendarMonthViewProps = {
  events: Event[];
  currentDate: Date;
  holidays: { [key: string]: string };
};

export const CalendarMonthView = ({ events, currentDate, holidays }: CalendarMonthViewProps) => {
  const { filteredEvents } = useSearch(events, currentDate, CalendarView_e.Month);
  const { notifiedEvents } = useNotifications(events);

  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <WeekDaysTableColumnHeader />
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
                    width={CALENDAR_TABLE_COLUMN_WIDTH}
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
                          const isNotified = notifiedEvents.includes(event.id);

                          return (
                            <ScheduleDay key={event.id} event={event} isNotified={isNotified} />
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
