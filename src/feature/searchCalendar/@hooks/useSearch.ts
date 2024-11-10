/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';

import { Event } from '../../../types';
import { getFilteredEvents } from '../../../utils/eventUtils';

export type UseSearch = {
  filteredEvents: Event[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
};

export const useSearch = (
  events: Event[],
  currentDate: Date,
  view: 'week' | 'month'
): UseSearch => {
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
