import { Button, Flex } from '@chakra-ui/react';
import { useSaveEvent } from '@hooks/useSaveEvent';

import { TEST_ID } from '@/constants/testID';

export const EditingEventButton = () => {
  const {
    saveWithValidation,
    isEditing,
    splitRecurringEventWithValidation,
    splitEventRemove,
    resetForm,
    isRepeat,
  } = useSaveEvent();

  return (
    <Flex direction="column" gap={1} flex={1} m={1}>
      <Button data-testid={TEST_ID.SUBMIT_BUTTON} onClick={saveWithValidation} colorScheme="blue">
        {isEditing ? '일정 수정' : '일정 추가'}
      </Button>

      {isEditing && isRepeat && (
        <>
          <Button
            data-testid={TEST_ID.SPLIT_RECURRING_EVENT_BUTTON}
            onClick={splitRecurringEventWithValidation}
            colorScheme="green"
          >
            해당 일정만 수정
          </Button>

          <Button
            data-testid={TEST_ID.SPLIT_RECURRING_EVENT_BUTTON}
            onClick={splitEventRemove}
            colorScheme="green"
          >
            해당 일정만 삭제
          </Button>
        </>
      )}
      {isEditing && (
        <Button data-testid={TEST_ID.RESET_EVENT_FORM_BUTTON} onClick={resetForm} colorScheme="red">
          취소
        </Button>
      )}
    </Flex>
  );
};
