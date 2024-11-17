import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

import { Event } from '../../../entities/event/model/type.ts';
import { useNotifications } from '../../../features/notification/model/useNotifications.ts';

interface NotificationMessageProps {
  events: Event[];
}

const NotificationMessage = ({ events }: NotificationMessageProps) => {
  const { notifications, setNotifications } = useNotifications(events);

  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </>
  );
};

export default NotificationMessage;
