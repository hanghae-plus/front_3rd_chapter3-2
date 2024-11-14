import { Heading, Text, VStack } from '@chakra-ui/react';

import { CalendarDayCell } from './CalendarDayCell';
import { checkIsRepeatEvent } from '../lib/repeat';

import { formatDate, formatWeek, getWeekDates, isEqualDate } from '@/features/event/lib/dateUtils';
import { weekDays } from '@/shared/model/date-config';
import { Table } from '@/shared/ui';
import { Event } from '@/types';

type WeekViewCalendarProps = {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
};

export const WeekViewCalendar = ({
  currentDate,
  events,
  notifiedEvents,
  holidays,
}: WeekViewCalendarProps) => {
  const weekDates = getWeekDates(currentDate);
  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table.Container variant="simple" w="full">
        <Table.Header>
          <Table.Row>
            {weekDays.map((day) => (
              <Table.Th key={day} width="14.28%">
                {day}
              </Table.Th>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            {weekDates.map((date) => {
              const dateString = formatDate(currentDate, date.getDate());
              const holiday = holidays[dateString];
              return (
                <Table.Cell
                  key={date.toISOString()}
                  height="100px"
                  verticalAlign="top"
                  width="14.28%"
                >
                  <Text fontWeight="bold">{date.getDate()}</Text>
                  {holiday && (
                    <Text color="red.500" fontSize="sm">
                      {holiday}
                    </Text>
                  )}
                  {events
                    .filter((event) => isEqualDate(new Date(event.date), date))
                    .map((event) => {
                      const isNotified = notifiedEvents.includes(event.id);
                      const isRepeatEvent = checkIsRepeatEvent(event);
                      return (
                        <CalendarDayCell
                          key={event.id}
                          event={event}
                          isNotified={isNotified}
                          isRepeatEvent={isRepeatEvent}
                        />
                      );
                    })}
                </Table.Cell>
              );
            })}
          </Table.Row>
        </Table.Body>
      </Table.Container>
    </VStack>
  );
};
