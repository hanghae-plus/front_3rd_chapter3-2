import { BellIcon } from '@chakra-ui/icons';
import { Box, Text } from '@chakra-ui/react';

import { Event } from '../../../../entities/event/model/types';
import { HStack } from '../../../../shared/ui/Stack';

interface EventCellProps {
  event: Event;
  isNotified: boolean;
}

export const EventCell = ({ event, isNotified }: EventCellProps) => (
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
      {event.repeat?.type !== 'none' && (
        <Text fontSize="xs" color="gray.500">
          {event.repeat?.type === 'daily' && '매일'}
          {event.repeat?.type === 'weekly' && '매주'}
          {event.repeat?.type === 'monthly' && '매월'}
          {event.repeat?.type === 'yearly' && '매년'}
        </Text>
      )}
      <Text fontSize="sm" noOfLines={1}>
        {event.title}
      </Text>
    </HStack>
  </Box>
);
