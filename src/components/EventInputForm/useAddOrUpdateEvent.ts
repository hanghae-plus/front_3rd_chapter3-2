import { useToast } from '@chakra-ui/react';

import { useEventFormStore } from '../../store/useEventFormStore';
import { useEventOverlapStore } from '../../store/useEventOverlapStore';
import { Event, EventForm } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';

export type UseAddOrUpdateEventProps = {
  events: Event[];
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
};

export const useAddOrUpdateEvent = ({ events, saveEvent }: UseAddOrUpdateEventProps) => {
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
    timeErrorRecord: { startTimeError, endTimeError },
    editingEvent,
    resetForm,
  } = useEventFormStore();

  const toast = useToast();

  const { openDialog } = useEventOverlapStore();

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
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      openDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return addOrUpdateEvent;
};
