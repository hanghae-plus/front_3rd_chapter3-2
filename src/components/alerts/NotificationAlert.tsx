import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';

interface Props {
  notification: { id: string; message: string };
  onClick: () => void;
}

export const NotificationAlert = ({ notification, onClick }: Props) => {
  return (
    <Alert status="info" variant="solid" width="auto">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
      </Box>
      <CloseButton onClick={onClick} />
    </Alert>
  );
};
