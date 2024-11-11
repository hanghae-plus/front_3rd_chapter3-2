import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

interface Notification {
  id: string;
  message: string;
}

interface NotificationDialogProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

export const NotificationDialog = ({
  notifications,
  setNotifications,
}: NotificationDialogProps) => {
  return (
    <>
      {notifications?.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications(notifications.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </>
  );
};
