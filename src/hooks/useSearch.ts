import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getFilteredEvents } from '../utils/eventUtils';

export const useSearch = (
  events: Event[],
  repeatEvent: Event[],
  currentDate: Date,
  view: 'week' | 'month'
) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  const filteredRepeats = useMemo(() => {
    return getFilteredEvents(repeatEvent, searchTerm, currentDate, view);
  }, [repeatEvent, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
    filteredRepeats,
  };
};
