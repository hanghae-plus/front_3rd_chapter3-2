import { FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';

import { EventItem } from './EventItem';
import { useSearch } from '../../hooks/useSearch';
import { EventId } from '../../types';

type Props = ReturnType<typeof useSearch> & {
  notifiedEvents: EventId[];

  deleteEvent: (id: EventId) => Promise<void>;
};

export const EventSearchForm = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  deleteEvent,
}: Props) => {
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
          <EventItem
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            deleteEvent={deleteEvent}
          />
        ))
      )}
    </VStack>
  );
};
