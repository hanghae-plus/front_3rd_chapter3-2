import { DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';

import { RepeatEvent } from '../types';

interface EventItemProps {
  event: RepeatEvent;
  isModifying?: boolean;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onSingleDelete?: (id: string, date: string) => void;
}

const EventItem = ({ event, isModifying = false, onDelete, onSingleDelete }: EventItemProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getRepeatText = () => {
    if (!event.isRepeating) return '';

    const intervalText = event.repeatInterval > 1 ? event.repeatInterval : '';
    switch (event.repeatType) {
      case 'daily':
        return `${intervalText}일마다 반복`;
      case 'weekly':
        return `${intervalText}주마다 반복`;
      case 'monthly':
        return `${intervalText}개월마다 반복`;
      case 'yearly':
        return `${intervalText}년마다 반복`;
      default:
        return '';
    }
  };

  const handleDelete = () => {
    if (!event.isRepeating) {
      onDelete?.(event.id);
    } else {
      onOpen();
    }
  };

  return (
    <HStack spacing={2}>
      <Text>{event.title}</Text>
      {event.isRepeating && !isModifying && (
        <RepeatIcon
          data-testid="repeat-icon"
          title={getRepeatText()}
          color="blue.500"
          cursor="help"
        />
      )}
      <IconButton aria-label="삭제" icon={<DeleteIcon />} onClick={handleDelete} size="sm" />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>반복 일정 삭제</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Button
                w="100%"
                onClick={() => {
                  onSingleDelete?.(event.id, event.date);
                  onClose();
                }}
              >
                이 일정만 삭제
              </Button>
              <Button
                w="100%"
                onClick={() => {
                  onDelete?.(event.id);
                  onClose();
                }}
              >
                모든 반복 일정 삭제
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
};

export default EventItem;
