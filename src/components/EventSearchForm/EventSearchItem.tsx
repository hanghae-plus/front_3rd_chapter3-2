import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';

import { notificationOptions } from '../../constants/notification';
import { useEventFormStore } from '../../store/useEventFormStore';
import { Event, EventId, RepeatType } from '../../types';

const REPEAT_TYPE_LABEL: Record<Exclude<RepeatType, 'none'>, string> = {
  daily: '일',
  weekly: '주',
  monthly: '월',
  yearly: '년',
};

type Props = {
  event: Event;
  notifiedEvents: EventId[];

  deleteEvent: (id: EventId) => Promise<void>;
};

export const EventSearchItem = ({ event, notifiedEvents, deleteEvent }: Props) => {
  const { setEditingEvent } = useEventFormStore();
  const isNotified = notifiedEvents.includes(event.id);

  return (
    <Box
      key={event.id}
      borderWidth={1}
      borderRadius="lg"
      p={3}
      width="100%"
      data-testid={`event-item-${event.id}`}
    >
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
              {REPEAT_TYPE_LABEL[event.repeat.type]}
              마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Text>
          )}

          <Text>
            알림:{' '}
            {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
          </Text>
        </VStack>

        <HStack>
          <IconButton
            aria-label="Edit event"
            icon={<EditIcon />}
            onClick={() => setEditingEvent(event)}
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
