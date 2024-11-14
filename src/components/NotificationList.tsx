import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

import { Notification } from '../types';

type Props = {
  notifications: Notification[];
  removeNotification: (index: number) => void;
};

export const NotificationList = ({ notifications, removeNotification }: Props) => {
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
              <CloseButton data-testid="close-button" onClick={() => removeNotification(index)} />
            </Alert>
          ))}
        </VStack>
      )}
    </>
  );
};
