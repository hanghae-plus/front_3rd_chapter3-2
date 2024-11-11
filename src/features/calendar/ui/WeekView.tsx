import { Heading, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react';
import { WeekDay, WeekHead } from '@entities/calendar/ui';
import { Event } from '@entities/event/model/types';
import { formatWeek, getWeekDates } from '@features/calendar/model/utils';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const WeekView = ({ currentDate, filteredEvents, notifiedEvents }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <WeekHead weekDays={weekDays} />

        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%;">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {filteredEvents
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
                    const isNotified = notifiedEvents?.includes(event.id);
                    return <WeekDay key={event.id} event={event} isNotified={isNotified} />;
                  })}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
