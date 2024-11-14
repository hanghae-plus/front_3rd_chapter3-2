import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';

import { EventItem } from './EventItem';
import { weekDays } from '../../constants/eventCalendar';
import { Event, EventId } from '../../types';
import { formatWeek, getWeekDates } from '../../utils/dateUtils';

type Props = {
  currentDate: Date;

  filteredEvents: Event[];
  notifiedEvents: EventId[];
};

export const WeekView = ({ currentDate, filteredEvents, notifiedEvents }: Props) => {
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
                  .map((event) => (
                    <EventItem
                      key={event.id}
                      isNotified={notifiedEvents.includes(event.id)}
                      event={event}
                    />
                  ))}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
