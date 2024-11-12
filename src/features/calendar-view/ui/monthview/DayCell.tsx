import { Td, Text, VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { DayCellProps } from '../../model/types';
import { EventItem } from '../EventItem';

export const DayCell = memo(
  ({ day, dateString, holiday, events, notifiedEvents }: DayCellProps) => {
    if (!day) {
      return <Td width="14.28%" height="100px" />;
    }

    return (
      <Td
        height="100px"
        width="14.28%"
        verticalAlign="top"
        position="relative"
        p={2}
        _hover={{ bg: 'gray.50' }}
      >
        <VStack align="stretch" spacing={1}>
          <Text fontWeight="bold">{day}</Text>
          {holiday && (
            <Text color="red.500" fontSize="sm">
              {holiday}
            </Text>
          )}
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              isNotified={notifiedEvents.includes(event.id)}
            />
          ))}
        </VStack>
      </Td>
    );
  }
);

DayCell.displayName = 'DayCell';
