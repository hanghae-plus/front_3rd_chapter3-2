import { Button, Flex, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { useEventFormStore } from '@features/event/model/stores';
import { EventList } from '@features/event/ui';

interface EventViewProps {
  hasEvent: boolean;
  filteredEvents: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  deleteEvent: (eventId: string) => void;
  deleteAllEvents: () => void;
}

export const EventView = ({
  hasEvent,
  filteredEvents,
  notifiedEvents,
  deleteEvent,
  deleteAllEvents,
  searchTerm,
  setSearchTerm,
}: EventViewProps) => {
  const { editEvent } = useEventFormStore();
  return (
    <VStack data-testid="event-list" w="290px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>
          <Flex justify="space-between" align="center">
            일정 검색
            {hasEvent && (
              <Button colorScheme="red" size="sm" onClick={deleteAllEvents}>
                초기화
              </Button>
            )}
          </Flex>
        </FormLabel>
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
