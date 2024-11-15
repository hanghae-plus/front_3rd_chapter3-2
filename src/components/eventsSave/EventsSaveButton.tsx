import { Button } from '@chakra-ui/react';

import { Event } from '../../types';

interface EventsSaveButtonProps {
  editingEvent: Event | null;
  addOrUpdateEvent: () => Promise<void>;
}
const EventsSaveButton = ({ editingEvent, addOrUpdateEvent }: EventsSaveButtonProps) => {
  return (
    <>
      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </>
  );
};

export default EventsSaveButton;
