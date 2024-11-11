import { VStack } from '@chakra-ui/react';
import React from 'react';

import NotificationItem from './NotificationItem';

interface Notification {
  id: string;
  message: string;
}

interface NotificationProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationIndex = ({ notifications, setNotifications }: NotificationProps) => {
  return (
    <>
      <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={index}
            notification={notification}
            index={index}
            setNotifications={setNotifications}
          />
        ))}
      </VStack>
    </>
  );
};

export default NotificationIndex;
