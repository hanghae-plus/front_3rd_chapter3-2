import { create } from 'zustand';

import { Event } from '../types';

interface EventOverlapState {
  /** 중복된 이벤트 목록 */
  overlappingEvents: Event[];

  isOverlapDialogOpen: boolean;
  openDialog: (overlapping: Event[]) => void;
  closeDialog: () => void;
}

export const useEventOverlapStore = create<EventOverlapState>()((set) => ({
  overlappingEvents: [],

  isOverlapDialogOpen: false,
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
