import { Heading, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';

import { EventCell } from './EventCell';
import { getWeekDates } from '../../../../entities/calendar/lib/calendarUtils';
import { Event } from '../../../../entities/event/model/types';
import { weekDays } from '../../../../shared/config/constant';
import { formatWeek } from '../../../../shared/lib/date';
import { VStack } from '../../../../shared/ui/Stack';

interface NotifiedEventsState {
  [key: string]: number;
}

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: NotifiedEventsState;
}

export const WeekView = ({ currentDate, events, notifiedEvents }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  // 일반 일정과 반복 일정 분리
  const regularEvents = events.filter((event) => !event.repeat || event.repeat.type === 'none');
  const repeatingEvents = events.filter(
    (event) => event.repeat?.type !== 'none' && event.repeatDate
  );
  console.log(events);
  // 특정 날짜에 해당하는 이벤트들을 가져오는 함수
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];

    // 일반 일정 필터링
    const regularEventsForDate = regularEvents.filter((event) => event.date === dateString);

    // 반복 일정 필터링
    const repeatingEventsForDate = repeatingEvents.filter((event) =>
      event.repeatDate?.some((repeatDate) => repeatDate.split('T')[0] === dateString)
    );

    return [...regularEventsForDate, ...repeatingEventsForDate];
  };

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
            {weekDates.map((date) => {
              const eventsForDate = getEventsForDate(date);

              return (
                <Td
                  key={date.toISOString()}
                  height="100px"
                  verticalAlign="top"
                  width="14.28%"
                  position="relative"
                  p={2}
                  _hover={{ bg: 'gray.50' }}
                >
                  <VStack align="stretch" spacing={1}>
                    <Text fontWeight="bold">{date.getDate()}</Text>
                    {eventsForDate.map((event) => (
                      <EventCell
                        key={`${event.id}-${date.toISOString()}`}
                        event={{
                          ...event,
                          date: date.toISOString().split('T')[0], // 현재 표시되는 날짜로 설정
                        }}
                        isNotified={notifiedEvents[event.id] > 0}
                      />
                    ))}
                  </VStack>
                </Td>
              );
            })}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
