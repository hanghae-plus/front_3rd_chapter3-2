import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import EventList from './EventList.tsx';
import { Event } from '../../../entities/event/model/type.ts';
import { useCalendarView } from '../../calendar/model/useCalendarView.ts';
import { useNotifications } from '../../notification/model/useNotifications.ts';
import { useSearch } from '../model/useSearch.ts';

interface EventSearchProps {
  events: Event[];
  filteredEvents: Event[];
  editEvent: void;
  deleteEvent: void;
}

const EventSearch = ({ events, deleteEvent, editEvent }: EventSearchProps) => {
  const { view, currentDate } = useCalendarView();

  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { notifiedEvents } = useNotifications(events);

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
        filteredEvents.map((event: Event) => (
          <EventList
            event={event}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            notifiedEvents={notifiedEvents}
          />
        ))
      )}
    </VStack>
  );
};

export default EventSearch;
