import { VStack, Alert, AlertIcon, Box, AlertTitle, CloseButton } from '@chakra-ui/react';

import { useCombinedContext } from '../../provider';

export function Notifications() {
  const { notifications, setNotifications } = useCombinedContext();
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
}
