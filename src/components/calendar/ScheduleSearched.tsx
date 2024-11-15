import { BellIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, VStack, IconButton } from '@chakra-ui/react';

import { CALENDAR_NOTIFICATION_OPTIONS } from '../../constants';
import { Event } from '../../types';

type ScheduleSearchedProps = {
  event: Event;
  isNotified: boolean;
  // eslint-disable-next-line no-unused-vars
  editEvent: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  deleteEvent: (id: string) => void;
};

export const ScheduleSearched = ({
  event,
  isNotified,
  editEvent,
  deleteEvent,
}: ScheduleSearchedProps) => {
  return (
    <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
      <HStack justifyContent="space-between">
        <VStack align="start">
          <HStack>
            {isNotified && <BellIcon color="red.500" />}
            <Text
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'red.500' : 'inherit'}
            >
              {event.title}
            </Text>
          </HStack>
          <Text>{event.date}</Text>
          <Text>
            {event.startTime} - {event.endTime}
          </Text>
          <Text>{event.description}</Text>
          <Text>{event.location}</Text>
          <Text>카테고리: {event.category}</Text>
          {event.repeat.type !== 'none' && (
            <Text>
              반복: {event.repeat.interval}
              {event.repeat.type === 'daily' && '일'}
              {event.repeat.type === 'weekly' && '주'}
              {event.repeat.type === 'monthly' && '월'}
              {event.repeat.type === 'yearly' && '년'}
              마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Text>
          )}
          <Text>
            알림:{' '}
            {
              CALENDAR_NOTIFICATION_OPTIONS.find(
                (option) => option.value === event.notificationTime
              )?.label
            }
          </Text>
        </VStack>
        <HStack>
          <IconButton
            aria-label="Edit event"
            icon={<EditIcon />}
            onClick={() => editEvent(event)}
          />
          <IconButton
            aria-label="Delete event"
            icon={<DeleteIcon />}
            onClick={() => deleteEvent(event.id)}
          />
        </HStack>
      </HStack>
    </Box>
  );
};
