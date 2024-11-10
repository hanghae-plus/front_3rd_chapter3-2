import { createContext } from 'react';

import { Event } from '@/types';

export interface DialogContextType {
  dialogName: string;
  overlapEvents: Event[];
  setOverlapEvents: (v: Event[]) => void;
  setDialogName: (v: string) => void;
}

export const DialogContext = createContext<DialogContextType | null>(null);
