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
import React, { useRef } from 'react';

import { useDialogContext } from '@/context/useDialog';
import { useSaveEvent } from '@/hooks/useSaveEvent';
import { TEST_ID } from '@/constants/testID';

export const AlertDuplicateSchedule: React.FC = () => {
  const { dialogName, setDialogName, overlapEvents, setOverlapEvents } = useDialogContext();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isRecurring, save, splitRecurringEvent } = useSaveEvent();

  const updateSchedule = () => {
    isRecurring ? splitRecurringEvent() : save();
  };

  return (
    <AlertDialog
      isOpen={dialogName === 'overlappingEvents'}
      leastDestructiveRef={cancelRef}
      onClose={() => setDialogName('')}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlapEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setDialogName('')}>
              취소
            </Button>
            <Button
              data-testid={TEST_ID.FORCE_SAVE}
              colorScheme="red"
              onClick={() => {
                setDialogName('');
                setOverlapEvents([]);
                updateSchedule();
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
