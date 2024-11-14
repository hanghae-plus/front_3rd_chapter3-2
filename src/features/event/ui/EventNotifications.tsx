import { VStack } from '@chakra-ui/react';

import { useEventContext } from '@/features/event/model/EventContext';
import { Alert } from '@/shared/ui';

export const EventNotifications = () => {
  const { notificationsValues } = useEventContext();
  const { notifications, removeNotification } = notificationsValues;

  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              status="info"
              variant="solid"
              width="auto"
              message={notification.message}
              onClose={() => removeNotification(index)}
            />
          ))}
        </VStack>
      )}
    </>
  );
};
