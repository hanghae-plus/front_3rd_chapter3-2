import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import React from 'react';

import AlertDialogBodyText from './AlertDialogBodyText';
import AlertDialogFooterText from './AlertDialogFooterText';
import { Event, EventForm, RepeatType } from '../../types';

interface AlertDialogProps {
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  overlappingEvents: Event[];
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

const AlertDialogIndex = ({
  isOverlapDialogOpen,
  setIsOverlapDialogOpen,
  cancelRef,
  overlappingEvents,
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
}: AlertDialogProps) => {
  function handleIsOverlapDialogOpen() {
    setIsOverlapDialogOpen(false);
  }
  return (
    <>
      <AlertDialog
        isOpen={isOverlapDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleIsOverlapDialogOpen}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              일정 겹침 경고
            </AlertDialogHeader>

            <AlertDialogBody>
              <AlertDialogBodyText overlappingEvents={overlappingEvents} />
            </AlertDialogBody>

            <AlertDialogFooter>
              <AlertDialogFooterText
                setIsOverlapDialogOpen={setIsOverlapDialogOpen}
                cancelRef={cancelRef}
                saveEvent={saveEvent}
                editingEvent={editingEvent}
                title={title}
                date={date}
                startTime={startTime}
                endTime={endTime}
                description={description}
                location={location}
                category={category}
                isRepeating={isRepeating}
                repeatType={repeatType}
                repeatInterval={repeatInterval}
                repeatEndDate={repeatEndDate}
                notificationTime={notificationTime}
                resetForm={resetForm}
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AlertDialogIndex;
