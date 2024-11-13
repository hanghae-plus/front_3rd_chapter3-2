import { Button, useToast } from '@chakra-ui/react';
import { Event, EventForm } from '@entities/event/model/types';

import { useEventFormStore, useEventStore } from '../model/stores';
import { findOverlappingEvents } from '../model/utils';

interface AddOrUpdateButtonProps {
  events: Event[];
  saveEvent: (event: EventForm, isEditing: boolean) => Promise<void>;
}

export const AddOrUpdateButton = ({ events, saveEvent }: AddOrUpdateButtonProps) => {
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
    startTimeError,
    endTimeError,
    editingEvent,
    repeatDepth,
    resetForm,
  } = useEventFormStore();

  const { setIsOverlapDialogOpen, setOverlappingEvents } = useEventStore();

  const toast = useToast();
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isRepeating && repeatInterval <= 0) {
      toast({
        title: '반복 간격은 0보다 커야 합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isRepeating && date > repeatEndDate) {
      toast({
        title: '반복 종료일은 시작일 보다 이후여야 합니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = {
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
        depth: repeatDepth || 'fix',
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData, Boolean(editingEvent));
      resetForm();
    }
  };
  return (
    <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
      {editingEvent ? '일정 수정' : '일정 추가'}
    </Button>
  );
};
