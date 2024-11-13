import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../types';

interface EventListViewProps {
  event: Event;
  notifiedEvents: string[];
  type: 'main' | 'repeat';
}

export const EventListView = ({ event, notifiedEvents, type }: EventListViewProps) => {
  const isNotified = notifiedEvents.includes(event.id);
  const boxbg = () => {
    if (isNotified) {
      return 'red.100';
    }
    if (type === 'main') {
      return 'green.100';
    }
    return 'yellow.100';
  };

  return (
    <Box
      key={event.id}
      p={1}
      my={1}
      bg={boxbg()}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        <Text fontSize="sm" noOfLines={1}>
          {type === 'repeat' && '🔂 '} {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
