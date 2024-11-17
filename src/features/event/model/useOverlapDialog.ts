import { useState } from 'react';

import { Event } from '../../../entities/event/model/type.ts';

const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const openOverlapDialog = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeOverlapDialog = () => {
    setOverlappingEvents([]);
    setIsOverlapDialogOpen(false);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    openOverlapDialog,
    closeOverlapDialog,
  };
};

export default useOverlapDialog;
