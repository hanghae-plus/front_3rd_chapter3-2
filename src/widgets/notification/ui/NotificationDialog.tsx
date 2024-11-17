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

import { Event } from '../../../entities/event/model/type.ts';
import { useEventForm } from '../../../features/event/model/useEventForm.ts';
import { useEventOperations } from '../../../features/event/model/useEventOperations.ts';

interface NotificationDialogProps {
  isOverlapDialogOpen: boolean;
  closeOverlapDialog: () => void;
  overlappingEvents: Event[];
}

const NotificationDialog = ({
  isOverlapDialogOpen,
  closeOverlapDialog,
  overlappingEvents,
}: NotificationDialogProps) => {
  const {
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
    editingEvent,
    setEditingEvent,
  } = useEventForm();

  const { saveEvent } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => closeOverlapDialog()}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((overlappingEvent) => (
              <Text key={overlappingEvent.id}>
                {overlappingEvent.title} ({overlappingEvent.date} {overlappingEvent.startTime}-
                {overlappingEvent.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => closeOverlapDialog()}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                closeOverlapDialog();
                saveEvent({
                  id: editingEvent ? editingEvent.id : '',
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

export default NotificationDialog;
