import { useFetchEvents } from '@hooks/events/useFetchEvents';
import useCalendarViewStore from '@stores/useCalendarViewStore';
import useSearchStore from '@stores/useSearchStore';
import { getFilteredEvents } from '@utils/eventUtils';
import { useMemo } from 'react';

export const useSearch = () => {
  const { events } = useFetchEvents();
  const view = useCalendarViewStore((state) => state.view);
  const currentDate = useCalendarViewStore((state) => state.currentDate);
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const filteredEvents = useMemo(() => {
    const memoFiltered = getFilteredEvents(events, searchTerm, currentDate, view);
    return memoFiltered;
  }, [events, searchTerm, currentDate, view]);

  return {
    events,
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
