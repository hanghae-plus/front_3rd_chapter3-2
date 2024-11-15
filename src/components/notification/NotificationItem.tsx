import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';
import React from 'react';

interface Notification {
  id: string;
  message: string;
}

interface NotificationItemProps {
  notification: Notification;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  index: number;
}

const NotificationItem = ({ notification, setNotifications, index }: NotificationItemProps) => {
  function handleRemoveNotificationChange(index: number) {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }
  return (
    <>
      <Alert key={index} status="info" variant="solid" width="auto">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
        </Box>
        <CloseButton onClick={() => handleRemoveNotificationChange(index)} />
      </Alert>
    </>
  );
};

export default NotificationItem;
