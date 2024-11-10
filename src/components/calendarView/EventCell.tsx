import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../../types';

interface Props {
  event: Event;
  notifiedEvents: string[];
}

export const EventCell = ({ event, notifiedEvents }: Props) => {
  const isNotified = notifiedEvents.includes(event.id);

  return (
    <Box
      key={event.id}
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
