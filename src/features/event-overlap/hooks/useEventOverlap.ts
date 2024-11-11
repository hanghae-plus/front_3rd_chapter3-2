import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { findOverlappingEvents } from '../../../entities/event/lib/eventUtils';
import { Event } from '../../../entities/event/model/types';
import { EventForm } from '../../../types';

interface UseEventOverlapProps {
  events: Event[];
  onSaveSuccess: () => void;
  saveEvent: (eventData: EventForm | Event) => Promise<void>;
}

export const useEventOverlap = ({ events, onSaveSuccess, saveEvent }: UseEventOverlapProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingSaveEvent, setPendingSaveEvent] = useState<Event | null>(null);

  const toast = useToast();

  const handleEventSave = useCallback(
    async (eventData: Event) => {
      if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
        toast({
          title: '필수 정보를 모두 입력해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const overlapping = findOverlappingEvents(events, eventData);
      if (overlapping.length > 0) {
        setOverlappingEvents(overlapping);
        setPendingSaveEvent(eventData);
        setIsOpen(true);
      } else {
        try {
          await saveEvent(eventData);
          onSaveSuccess();
          toast({
            title: '일정이 저장되었습니다.',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        } catch (error) {
          toast({
            title: '일정 저장에 실패했습니다.',
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    },
    [events, saveEvent, onSaveSuccess, toast]
  );

  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    setPendingSaveEvent(null);
    setOverlappingEvents([]);
  }, []);

  const handleDialogConfirm = useCallback(async () => {
    if (!pendingSaveEvent) return;

    try {
      await saveEvent(pendingSaveEvent);
      onSaveSuccess();
      handleDialogClose();
      toast({
        title: '일정이 저장되었습니다.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: '일정 저장에 실패했습니다.',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [pendingSaveEvent, saveEvent, onSaveSuccess, handleDialogClose, toast]);

  return {
    isOpen,
    overlappingEvents,
    handleEventSave,
    handleDialogClose,
    handleDialogConfirm,
  };
};
