import React, { PropsWithChildren, useMemo, useState } from 'react';

import { DialogContext } from './dialogContext';

import { Event } from '@/types';

const DialogProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [dialogName, setDialogName] = useState<string>('');
  const [overlapEvents, setOverlapEvents] = useState<Event[]>([]);

  const value = useMemo(
    () => ({ dialogName, setDialogName, overlapEvents, setOverlapEvents }),
    [dialogName, overlapEvents]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

export default DialogProvider;
