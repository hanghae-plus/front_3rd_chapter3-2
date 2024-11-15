import { Button } from '@chakra-ui/react';
import React from 'react';

import { Event, EventForm, RepeatType } from '../../types';

interface AlertDialogFooterTextProps {
  setIsOverlapDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cancelRef: React.RefObject<HTMLButtonElement>;
  // eslint-disable-next-line
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
  editingEvent: Event | null;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  resetForm: () => void;
}

const AlertDialogFooterText = ({
  cancelRef,
  setIsOverlapDialogOpen,
  saveEvent,
  editingEvent,
  title,
  date,
  startTime,
  endTime,
  description,
  location,
  category,
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,
  notificationTime,
  resetForm,
}: AlertDialogFooterTextProps) => {
  function handleIsOverlapDialogOpen() {
    setIsOverlapDialogOpen(false);
  }

  const handleSaveEvent = async () => {
    handleIsOverlapDialogOpen();
    await saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    });
    resetForm();
  };

  return (
    <>
      <Button ref={cancelRef} onClick={handleIsOverlapDialogOpen}>
        취소
      </Button>
      <Button data-testid="continueButton" colorScheme="red" onClick={handleSaveEvent} ml={3}>
        계속 진행
      </Button>
    </>
  );
};

export default AlertDialogFooterText;
