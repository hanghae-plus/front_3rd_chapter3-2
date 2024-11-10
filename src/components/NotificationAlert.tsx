import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';
import React from 'react';

interface NotificationAlertProps {
  notification: {
    id: string;
    message: string;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        message: string;
      }[]
    >
  >;
  index: number;
}

export const NotificationAlert = ({
  notification,
  setNotifications,
  index,
}: NotificationAlertProps) => {
  return (
    <Alert status="info" variant="solid" width="auto">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
      </Box>
      <CloseButton onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))} />
    </Alert>
  );
};
