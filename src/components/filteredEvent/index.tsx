import { Text } from '@chakra-ui/react';

import FilteredEventIem from './FilteredEventIem';
import { Event } from '../../types';

interface FilteredEventProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  // eslint-disable-next-line
  editEvent: (event: Event) => void;
  // eslint-disable-next-line
  deleteEvent: (id: string) => Promise<void>;
}
const FilteredEvent = ({
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: FilteredEventProps) => {
  return (
    <>
      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event, index) => (
          <FilteredEventIem
            key={event.id}
            event={event}
            notifiedEvents={notifiedEvents}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            index={index}
          />
        ))
      )}
    </>
  );
};

export default FilteredEvent;
