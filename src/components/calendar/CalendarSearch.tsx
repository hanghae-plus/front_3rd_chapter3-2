import { FormControl, FormLabel, Input, VStack, Text } from '@chakra-ui/react';

import { ScheduleSearched } from './ScheduleSearched';
import { useCalendarViewContext } from '../../hooks/useCalendarViewContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

type CalendarSearchProps = {
  events: Event[];
  // eslint-disable-next-line no-unused-vars
  editEvent: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  deleteEvent: (id: string) => void;
};

export const CalendarSearch = ({ events, editEvent, deleteEvent }: CalendarSearchProps) => {
  const { notifiedEvents } = useNotifications(events);
  const { view, currentDate } = useCalendarViewContext();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <ScheduleSearched
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
          />
        ))
      )}
    </VStack>
  );
};
