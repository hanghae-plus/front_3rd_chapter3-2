import { Button, useToast } from '@chakra-ui/react';

import { validateEvent } from '../../lib/eventValidate';
import { useEventContext } from '../../model/EventContext';

export const FormSubmitEventButton = () => {
  const { formValues, operationsValues, state } = useEventContext();
  const { startTimeError, endTimeError, editingEvent, resetForm, eventFormData } = formValues;
  const { saveEvent } = operationsValues;
  const { hasOverlapEvent } = state;

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (hasOverlapEvent()) {
      return;
    }

    const validationResult = validateEvent({
      event: eventFormData,
      error: {
        startTimeError,
        endTimeError,
      },
    });

    if (!validationResult.required) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!validationResult.time) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await saveEvent(eventFormData);
    resetForm();
  };

  return (
    <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
      {editingEvent ? '일정 수정' : '일정 추가'}
    </Button>
  );
};
