import { Alert, AlertIcon, AlertTitle, CloseButton } from '@chakra-ui/react';

import { VStack } from '../../../shared/ui/Stack';

interface NotificationManagerProps {
  notifications: {
    id: string;
    message: string;
  }[];
  clearNotification: (id: string) => void;
}

export const NotificationList = ({
  notifications,
  clearNotification,
}: NotificationManagerProps) => {
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
