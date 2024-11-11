import { Event } from '@entities/event/model/types';
import { create } from 'zustand';

interface EventState {
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  overlappingEvents: Event[];
  setOverlappingEvents: (events: Event[]) => void;
}

export const useEventStore = create<EventState>((set) => ({
  isOverlapDialogOpen: false,
  setIsOverlapDialogOpen: (isOpen: boolean) => set({ isOverlapDialogOpen: isOpen }),
  overlappingEvents: [],
  setOverlappingEvents: (events: Event[]) => set({ overlappingEvents: events }),
}));
