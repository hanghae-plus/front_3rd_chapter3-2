import { Button } from '@chakra-ui/react';
import { useSaveEvent } from '@hooks/useSaveEvent';
import useScheduleForm from '@stores/useScheduleForm';

export const EditingEventButton = () => {
  const isEditing = useScheduleForm((state) => state.isEditing);

  const { save } = useSaveEvent();

  return (
    <Button data-testid="event-submit-button" onClick={save} colorScheme="blue">
      {isEditing ? '일정 수정' : '일정 추가'}
    </Button>
  );
};
