import { VStack } from '@chakra-ui/react';
import React from 'react';

import { Event } from '../../types';
import FilteredEvent from '../filteredEvent';
import EventsSearchInput from './EventsSearchInput';

interface EventsSearchProps {
  searchTerm: string;
  // eslint-disable-next-line
  setSearchTerm: (value: React.SetStateAction<string>) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  // eslint-disable-next-line
  editEvent: (event: Event) => void;
  // eslint-disable-next-line
  deleteEvent: (id: string) => Promise<void>;
}

const EventSearch = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventsSearchProps) => {
  return (
    <>
      <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
        <EventsSearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <FilteredEvent
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </VStack>
    </>
  );
};

export default EventSearch;
