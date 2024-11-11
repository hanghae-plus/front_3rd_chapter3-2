import { atom, useAtom } from 'jotai';
import { useMemo } from 'react';

import { Event } from '../types';
import { getFilteredEvents } from '../utils/eventUtils';

const searchTermAtom = atom('');

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useAtom(searchTermAtom);

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
