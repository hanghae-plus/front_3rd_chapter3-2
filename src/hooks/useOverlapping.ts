import { useState } from 'react';

import { Event } from '../types.ts';

export const useOverlapping = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const alertOverlappingEvents = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  return { isOverlapDialogOpen, overlappingEvents, alertOverlappingEvents, closeDialog };
};
