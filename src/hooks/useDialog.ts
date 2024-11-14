import { atom, useAtom } from 'jotai';

import { Event } from '../types';

const isOverlapDialogOpenAtom = atom<boolean>(false);
const overlappingEventsAtom = atom<Event[]>([]);

export const useDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useAtom(isOverlapDialogOpenAtom);
  const [overlappingEvents, setOverlappingEvents] = useAtom(overlappingEventsAtom);

  return { isOverlapDialogOpen, setIsOverlapDialogOpen, overlappingEvents, setOverlappingEvents };
};
