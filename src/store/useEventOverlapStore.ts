import { create } from 'zustand';

import { Event } from '../types';

interface EventOverlapState {
  isOverlapDialogOpen: boolean;
  overlappingEvents: Event[];

  openDialog: (overlapping: Event[]) => void;
  closeDialog: () => void;
}

export const useEventOverlapStore = create<EventOverlapState>()((set) => ({
  isOverlapDialogOpen: false,
  overlappingEvents: [],

  openDialog: (overlapping) =>
    set(() => ({
      overlappingEvents: overlapping,
      isOverlapDialogOpen: true,
    })),
  closeDialog: () =>
    set(() => ({
      overlappingEvents: [],
      isOverlapDialogOpen: false,
    })),
}));
