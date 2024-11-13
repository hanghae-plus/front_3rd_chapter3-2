import { Heading, Table, Tbody, Thead } from '@chakra-ui/react';
import { memo } from 'react';

import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { getWeeksAtMonth } from '../../../../entities/calendar/lib/calendarUtils';
import { formatDate, formatMonth } from '../../../../shared/lib/date';
import { VStack } from '../../../../shared/ui/Stack';
import { MonthViewProps } from '../../model/types';

export const MonthView = memo(
  ({ currentDate, events, holidays, notifiedEvents }: MonthViewProps) => {
    const weeks = getWeeksAtMonth(currentDate);

    // 일반 일정과 반복 일정 분리
    const regularEvents = events.filter((event) => !event.repeat || event.repeat.type === 'none');
    const repeatingEvents = events.filter(
      (event) => event.repeat?.type !== 'none' && event.repeatDate
    );

    // 특정 날짜의 이벤트들을 가져오는 함수
    const getEventsForDate = (day: number | null) => {
      if (!day) return [];

      const dateString = formatDate(currentDate, day);

      // 일반 일정 필터링
      const regularEventsForDate = regularEvents.filter((event) => event.date === dateString);

      // 반복 일정 필터링
      const repeatingEventsForDate = repeatingEvents
        .filter((event) =>
          event.repeatDate?.some((repeatDate) => repeatDate.split('T')[0] === dateString)
        )
        .map((event) => ({
          ...event,
          date: dateString, // 현재 표시되는 날짜로 설정
        }));

      return [...regularEventsForDate, ...repeatingEventsForDate];
    };

    return (
      <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
        <Heading size="md" color="blue.600" fontWeight="semibold">
          {formatMonth(currentDate)}
        </Heading>

        <Table
          variant="simple"
          w="full"
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Thead>
            <CalendarHeader />
          </Thead>
          <Tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const dayEvents = getEventsForDate(day);

                  return (
                    <DayCell
                      key={dayIndex}
                      day={day}
                      dateString={dateString}
                      holiday={holidays[dateString]}
                      events={dayEvents}
                      notifiedEvents={notifiedEvents}
                    />
                  );
                })}
              </tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    );
  }
);

MonthView.displayName = 'MonthView';
