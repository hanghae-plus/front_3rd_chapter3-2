import { VStack } from '@chakra-ui/react';

import { NotificationAlert } from './NotificationAlert';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useNotifications } from '../../hooks/useNotifications';

export const Notification = () => {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));
  const { notifications, setNotifications } = useNotifications(events);

  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <NotificationAlert
              key={index}
              notification={notification}
              onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
            />
          ))}
        </VStack>
      )}
    </>
  );
};
