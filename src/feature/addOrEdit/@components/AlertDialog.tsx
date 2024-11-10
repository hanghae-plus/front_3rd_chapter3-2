import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { useCombinedContext } from '../../../provider';

export function AddAlertDialog() {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOverlapDialogOpen, closeOverlapDialog, overlappingEvents, saveEvent, currentEvent } =
    useCombinedContext();

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
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
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
                if (currentEvent) {
                  saveEvent(currentEvent);
                }
                closeOverlapDialog();
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
}
