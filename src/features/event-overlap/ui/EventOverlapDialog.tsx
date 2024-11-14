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
import { RefObject } from 'react';

import { Event } from '../../../entities/event/model/types';

interface EventOverlapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  overlappingEvents: Event[];
  cancelRef: RefObject<HTMLButtonElement>;
}

export const EventOverlapDialog = ({
  isOpen,
  onClose,
  onConfirm,
  overlappingEvents,
  cancelRef,
}: EventOverlapDialogProps) => (
  <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
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
          <Button ref={cancelRef} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>
            계속 진행
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);
