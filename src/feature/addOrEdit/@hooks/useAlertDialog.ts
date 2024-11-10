/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { Event } from '../../../types';

export type UseAlertDialog = {
  isOverlapDialogOpen: boolean;
  openOverlapDialog: (events: Event) => void;
  overlappingEvents: Event[];
  currentEvent: Event | null;
  setOverlappingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  closeOverlapDialog: () => void;
};

export function useAlertDialog(): UseAlertDialog {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const openOverlapDialog = (event: Event) => {
    setIsOverlapDialogOpen(true);
    setCurrentEvent(event);
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
    setCurrentEvent(null);
  };

  return {
    isOverlapDialogOpen,
    openOverlapDialog,
    currentEvent,
    overlappingEvents,
    setOverlappingEvents,
    closeOverlapDialog,
  };
}
