import { VStack, Heading, Table, Thead, Tr, Tbody, Td, Text } from '@chakra-ui/react';

import { ScheduleDay } from './ScheduleDay';
import { WeekDaysTableColumnHeader } from './WeekDaysTableColumnHeader';
import { CALENDAR_TABLE_COLUMN_WIDTH } from '../../constants';
import { CalendarView_e } from '../../hooks/useCalendarView';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';
import { formatWeek, getWeekDates } from '../../utils/dateUtils';

type CalendarWeekViewProps = {
  events: Event[];
  currentDate: Date;
};

export const CalendarWeekView = ({ events, currentDate }: CalendarWeekViewProps) => {
  const { filteredEvents } = useSearch(events, currentDate, CalendarView_e.Week);
  const { notifiedEvents } = useNotifications(events);

  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <WeekDaysTableColumnHeader />
        </Thead>
        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td
                key={date.toISOString()}
                height="100px"
                verticalAlign="top"
                width={CALENDAR_TABLE_COLUMN_WIDTH}
              >
                <Text fontWeight="bold">{date.getDate()}</Text>
                {filteredEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    const isNotified = notifiedEvents.includes(event.id);

                    return <ScheduleDay key={event.id} event={event} isNotified={isNotified} />;
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
