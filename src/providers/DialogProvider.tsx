import { AlertDialog, AlertDialogOverlay } from '@chakra-ui/react';
import React, { createContext, useRef, useState } from 'react';

import { ScheduleOverlapDialog } from '../components/dialog/ScheduleOverlapDialog';

// ! 다이얼로그 타입
export const Dialog_e = {
  ScheduleOverlap: 'ScheduleOverlap',
  NewDialog: 'NewDialog', // 신규 다이얼로그 추가시 여기에 추가
} as const;
export type Dialog_t = (typeof Dialog_e)[keyof typeof Dialog_e];

type DialogProps = {
  [Dialog_e.ScheduleOverlap]: React.ComponentProps<typeof ScheduleOverlapDialog>;
  [Dialog_e.NewDialog]: any; // 신규 다이얼로그 추가시 여기에 추가
};

const DIALOG_COMPONENTS = {
  [Dialog_e.ScheduleOverlap]: ScheduleOverlapDialog,
  [Dialog_e.NewDialog]: () => <>NewDialog</>, // 신규 다이얼로그 추가시 여기에 추가
} as const;

// ! 다이얼로그 컨텍스트
export interface DialogContextType {
  cancelRef: React.RefObject<HTMLButtonElement>;
  currentDialog: Dialog_t | null;
  dialogProps?: DialogProps[Dialog_t];
  // eslint-disable-next-line no-unused-vars
  openDialog: <T extends Dialog_t>(dialog: T, dialogProps?: DialogProps[T]) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | null>(null);

// ! 다이얼로그 프로바이더
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [currentDialog, setCurrentDialog] = useState<Dialog_t | null>(null);
  const [dialogProps, setDialogProps] = useState<Record<string, unknown>>();

  const cancelRef = useRef<HTMLButtonElement>(null);

  const openDialog = (dialog: Dialog_t, dialogProps?: DialogProps[Dialog_t]) => {
    setCurrentDialog(dialog);
    setDialogProps(dialogProps);
  };

  const closeDialog = () => {
    setCurrentDialog(null);
    setDialogProps({});
  };

  const DialogComponent = currentDialog ? DIALOG_COMPONENTS[currentDialog] : null;

  return (
    <DialogContext.Provider
      value={{ cancelRef, currentDialog, dialogProps, openDialog, closeDialog }}
    >
      {children}
      <AlertDialog
        isOpen={currentDialog !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => closeDialog()}
      >
        <AlertDialogOverlay>
          {currentDialog && DialogComponent && (
            <DialogComponent
              {...(dialogProps as DialogProps[typeof currentDialog])}
              cancelRef={cancelRef}
            />
          )}
        </AlertDialogOverlay>
      </AlertDialog>
    </DialogContext.Provider>
  );
}
