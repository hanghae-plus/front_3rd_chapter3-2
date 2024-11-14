import React from 'react';
import { VStack, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import EventItem from './EventItem.tsx';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  notifiedEvents: string[];
  notificationOptions: { value: number; label: string }[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  onRepeatIconClick: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  searchTerm,
  setSearchTerm,
  notifiedEvents,
  notificationOptions,
  editEvent,
  deleteEvent,
  onRepeatIconClick,
}) => {
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

      {events.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            notificationOptions={notificationOptions}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            onRepeatIconClick={onRepeatIconClick}
          />
        ))
      )}
    </VStack>
  );
};

export default EventList;