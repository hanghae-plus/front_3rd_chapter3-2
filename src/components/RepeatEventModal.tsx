import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import { Event, RepeatType } from '../types';

interface RepeatEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: Event | null;
}

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

const RepeatEventModal: React.FC<RepeatEventModalProps> = ({ isOpen, onClose, selectedEvent }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>반복 일정 정보</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedEvent && (
            <Text>
              {selectedEvent.repeat.interval}
              {getRepeatTypeLabel(selectedEvent.repeat.type)} 반복
              {selectedEvent.repeat.endDate ? ` (종료: ${selectedEvent.repeat.endDate})` : ''}
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            닫기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RepeatEventModal;