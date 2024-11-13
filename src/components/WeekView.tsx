import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { Event } from '../types';
import { EventListView } from './EventListView';
import { formatWeek, getWeekDates } from '../utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  repeatEvents: Event[];
  notifiedEvents: string[];
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const WeekView = ({
  currentDate,
  filteredEvents,
  repeatEvents,
  notifiedEvents,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
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
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {filteredEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    return (
                      <EventListView
                        event={event}
                        notifiedEvents={notifiedEvents}
                        type="main"
                        key={event.id}
                      />
                    );
                  })}
                {repeatEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    return (
                      <EventListView
                        event={event}
                        notifiedEvents={notifiedEvents}
                        type="repeat"
                        key={event.id}
                      />
                    );
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
