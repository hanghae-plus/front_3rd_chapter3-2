import { Tr, Td, Text } from '@chakra-ui/react';

import { CalendarBox } from './CalendarBox';
import { useCombinedContext } from '../../../provider';
import { formatDate, getEventsForDay, getWeeksAtMonth } from '../../../utils/dateUtils';

export function ViewMonth() {
  const { currentDate, holidays, filteredEvents, notifiedEvents } = useCombinedContext();
  const weeks = getWeeksAtMonth(currentDate);
  return (
    <>
      {weeks.map((week, weekIndex) => (
        <Tr key={weekIndex}>
          {week.map((day, dayIndex) => {
            const dateString = day ? formatDate(currentDate, day) : '';
            const holiday = holidays[dateString as keyof typeof holidays];

            return (
              <Td
                key={dayIndex}
                height="100px"
                verticalAlign="top"
                width="14.28%"
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
                      const { title, id, repeat } = event;
                      const isRepeat = !!repeat.id;

                      const isNotified = notifiedEvents.includes(id);
                      return (
                        <CalendarBox
                          key={id}
                          isNotified={isNotified}
                          title={title}
                          isRepeat={isRepeat}
                        /> //
                      );
                    })}
                  </>
                )}
              </Td>
            );
          })}
        </Tr>
      ))}
    </>
  );
}
