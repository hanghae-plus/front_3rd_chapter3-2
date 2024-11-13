import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import { useNotifications } from '@hooks/useNotifications';
import React from 'react';

import { TEST_ID } from '@/__tests__/constants';

export const Notification: React.FC = () => {
  const { notifications, deleteNotification } = useNotifications();

  if (notifications.length === 0) return;
  return (
    <VStack
      position="fixed"
      top={4}
      right={4}
      spacing={2}
      align="flex-end"
      data-testid={TEST_ID.ALERT}
    >
      {notifications.map((notification, index) => (
        <Alert key={index} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton onClick={() => deleteNotification(index)} />
        </Alert>
      ))}
    </VStack>
  );
};
