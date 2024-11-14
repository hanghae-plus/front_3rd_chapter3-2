import { Text, VStack } from '@chakra-ui/react';

import { EventItem } from './EventItem';
import { SearchBar } from './SearchBar';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';

export function EventList() {
  const { events } = useEventOperations(false);
  const { currentDate, view } = useCalendarView();
  const { filteredEvents } = useSearch(events, currentDate, view);

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <SearchBar />
      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => <EventItem key={event.id} event={event} />)
      )}
    </VStack>
  );
}
