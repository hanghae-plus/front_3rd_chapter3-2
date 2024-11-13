import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { useEventFormStore } from '../store/useEventFormStore';
import { useEventOverlapStore } from '../store/useEventOverlapStore';
import { Event, EventForm } from '../types';

type Props = {
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
};

export const DialogEventOverlapAlert = ({ saveEvent }: Props) => {
  const {
    eventForm: {
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      isRepeating,
      repeat: { type: repeatType, interval: repeatInterval, endDate: repeatEndDate },
      notificationTime,
    },
    editingEvent,
  } = useEventFormStore();

  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOverlapDialogOpen, overlappingEvents, closeDialog } = useEventOverlapStore();

  return (
    <AlertDialog isOpen={isOverlapDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDialog}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDialog}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                closeDialog();
                saveEvent({
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
              }}
              ml={3}
            >
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
