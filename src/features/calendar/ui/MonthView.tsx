import { Heading, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react';
import { WeekDay, WeekHead } from '@entities/calendar/ui';
import { Event } from '@entities/event/model/types';
import {
  getWeeksAtMonth,
  formatDate,
  formatMonth,
  getEventsForDay,
} from '@features/calendar/model/utils';

interface MonthViewProps {
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[];
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const MonthView = ({
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <WeekHead weekDays={weekDays} />

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
                    padding="4px"
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
                          const isNotified = notifiedEvents?.includes(event.id);
                          return <WeekDay key={event.id} event={event} isNotified={isNotified} />;
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
