import { BellIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../../types';

type DayEventProps = {
  event: Event;
  isNotified: boolean;
};

export const ScheduleDay = ({ event, isNotified }: DayEventProps) => {
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
        {event.repeat.type !== 'none' && <RepeatIcon data-testid="repeat-icon" />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
