import {
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  Text,
} from '@chakra-ui/react';

import { useDialog } from '../../hooks/useDialog';
import { Event } from '../../types';

type ScheduleOverlapDialogProps = {
  overlappingEvents: Event[];
  saveEvent: () => void;
};

export const ScheduleOverlapDialog = ({
  overlappingEvents,
  saveEvent,
}: ScheduleOverlapDialogProps) => {
  const { cancelRef, closeDialog } = useDialog();

  return (
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

            saveEvent();
          }}
          ml={3}
        >
          계속 진행
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};
