import { Alert, AlertIcon, AlertTitle, CloseButton } from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/types';
import { VStack } from '../../../shared/ui/Stack';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationManagerProps {
  events: Event[];
}

export const NotificationList = ({ events }: NotificationManagerProps) => {
  const { notifications, clearNotification } = useNotifications(events);

  return (
    <VStack position="fixed" top={4} right={4} spacing={2}>
      {notifications.map((notification) => (
        <Alert key={notification.id} status="info">
          <AlertIcon />
          <AlertTitle>{notification.message}</AlertTitle>
          <CloseButton onClick={() => clearNotification(notification.id)} />
        </Alert>
      ))}
    </VStack>
  );
};
