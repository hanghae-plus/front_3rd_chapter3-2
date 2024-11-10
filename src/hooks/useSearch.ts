import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import { Event } from '../types';
import { getFilteredEvents } from '../utils/eventUtils';

const searchTermAtom = atom('');
const filteredEventsAtom = atom<Event[]>([]);

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);
  const [filteredEvents, setFilteredEvents] = useAtom(filteredEventsAtom);

  useEffect(() => {
    setFilteredEvents(getFilteredEvents(events, searchTerm, currentDate, view));
  }, [setFilteredEvents, events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
