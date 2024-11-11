import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { useEventFormStore } from '@features/event/model/stores';
import { EventList } from '@features/event/ui';

interface EventViewProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  deleteEvent: (eventId: string) => void;
}

export const EventView = ({
  filteredEvents,
  notifiedEvents,
  deleteEvent,
  searchTerm,
  setSearchTerm,
}: EventViewProps) => {
  const { editEvent } = useEventFormStore();
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

      <EventList
        filteredEvents={filteredEvents}
        notifiedEvents={notifiedEvents}
        editEvent={editEvent}
        deleteEvent={deleteEvent}
      />
    </VStack>
  );
};
