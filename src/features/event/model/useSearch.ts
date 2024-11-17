import { useMemo, useState } from 'react';

import { getFilteredEvents } from '../../../entities/event/lib/eventUtils.ts';
import { Event } from '../../../entities/event/model/type.ts';

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
