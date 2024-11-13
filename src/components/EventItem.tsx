import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../types';

type Props = {
  event: Event;
  isNotified: boolean;
};

export const EventItem = ({ event, isNotified }: Props) => {
  const isRepeat = event.repeat.type !== 'none';

  return (
    <Box
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
          {isRepeat && '🔁'} {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
