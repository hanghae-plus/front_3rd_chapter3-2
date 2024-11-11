import { BellIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';

interface WeekDayProps {
  event: Event;
  isNotified: boolean;
}

export const WeekDay = ({ event, isNotified }: WeekDayProps) => {
  const isRepeat = event.repeat.type !== 'none';
  return (
    <Box
      key={event.id}
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gra`y.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isRepeat && <RepeatIcon />}
        {isNotified && <BellIcon />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
