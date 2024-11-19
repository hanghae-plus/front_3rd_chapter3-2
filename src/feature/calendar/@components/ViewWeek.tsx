import { Td, Text } from '@chakra-ui/react';

import { CalendarBox } from './CalendarBox';
import { useCombinedContext } from '../../../provider';
import { getWeekDates } from '../../../utils/dateUtils';

export function ViewWeek() {
  const { currentDate, filteredEvents, notifiedEvents } = useCombinedContext();

  const weekDates = getWeekDates(currentDate);
  return (
    <>
      {weekDates.map((date) => (
        <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
          <Text fontWeight="bold">{date.getDate()}</Text>
          {filteredEvents
            .filter((event) => new Date(event.date).toDateString() === date.toDateString())
            .map((event) => {
              const { title, id, repeat } = event;
              const isNotified = notifiedEvents.includes(id);
              const isRepeat = !!repeat.id;
              return (
                <CalendarBox key={id} isNotified={isNotified} title={title} isRepeat={isRepeat} /> //
              );
            })}
        </Td>
      ))}
    </>
  );
}
