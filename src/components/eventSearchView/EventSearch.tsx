import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { EventItem } from './EventItem';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';

export const EventSearch = () => {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  const { view, currentDate } = useCalendarView();
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
        filteredEvents.map((event) => <EventItem key={event.id} event={event} />)
      )}
    </VStack>
  );
};
