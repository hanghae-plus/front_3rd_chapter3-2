import { BellIcon, InfoIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';
import { memo } from 'react';

import { EventItemProps } from '../model/types';

const getRepeatTypeLabel = (type: string): string => {
  const repeatTypes = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };
  return repeatTypes[type as keyof typeof repeatTypes] || '';
};

export const EventItem = memo(({ event, isNotified }: EventItemProps) => {
  return (
    <Box
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
      _hover={{ bg: isNotified ? 'red.200' : 'gray.200' }}
      transition="background-color 0.2s"
      cursor="pointer"
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        {event.repeat?.type !== 'none' && <InfoIcon color="gray.500" w={3} h={3} />}
        {event.repeat?.type !== 'none' && (
          <Text fontSize="xs" color="gray.500">
            {getRepeatTypeLabel(event.repeat.type)}
          </Text>
        )}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
});

EventItem.displayName = 'EventItem';
