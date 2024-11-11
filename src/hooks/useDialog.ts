import { useContext } from 'react';

import { DialogContext, DialogContextType } from '../providers/DialogProvider';

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within an DialogProvider');
  }
  return context;
};
