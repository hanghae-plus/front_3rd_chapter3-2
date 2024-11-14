import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';

import SearchedEvents from './SearchedEvents';
import { useEventContext } from '../model/EventContext';

export const EventSearcher = () => {
  const { searchValues, notificationsValues } = useEventContext();

  const { searchTerm, filteredEvents, setSearchTerm } = searchValues;
  const { notifiedEvents } = notificationsValues;

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

      <SearchedEvents filteredEvents={filteredEvents} notifiedEvents={notifiedEvents} />
    </VStack>
  );
};
