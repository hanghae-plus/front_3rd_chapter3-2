import { Button, VStack, useToast } from '@chakra-ui/react';

import { BasicEventForm } from './BasicEventForm';
import { NotificationForm } from './NotificationForm';
import { RepeatEventForm } from './RepeatEventForm';
import { useDialog } from '../../hooks/useDialog';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventOperations } from '../../hooks/useEventOperations';
import { findOverlappingEvents } from '../../utils/eventOverlap';

export function EventForm() {
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
    resetForm,
  } = useEventForm();
  const { events, saveEvent } = useEventOperations(Boolean(editingEvent), () => null);
  const { setIsOverlapDialogOpen, setOverlappingEvents } = useDialog();
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

    const eventData = {
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
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <VStack w="400px" spacing={4}>
      <BasicEventForm />
      <RepeatEventForm />
      <NotificationForm />
      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
}
