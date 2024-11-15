/* eslint-disable no-unused-vars */
import { BellIcon, EditIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, HStack, VStack, Text, IconButton } from '@chakra-ui/react';
import React from 'react';

import { Event, RepeatType } from '../types';

interface EventItemProps {
  event: Event;
  notifiedEvents: string[];
  notificationOptions: { value: number; label: string }[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  onRepeatIconClick: (event: Event) => void;
}

const getIntervalLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

const EventItem: React.FC<EventItemProps> = ({
  event,
  notifiedEvents,
  notificationOptions,
  editEvent,
  deleteEvent,
  onRepeatIconClick, // 추가된 콜백
}) => {
  const handleRepeatIconClick = () => {
    if (event.repeat.type !== 'none') {
      onRepeatIconClick(event);
    }
  };

  return (
    <Box borderWidth={1} borderRadius="lg" p={3} width="100%">
      <HStack justifyContent="space-between">
        <VStack align="start">
          <HStack>
            {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
            {event.repeat.type !== 'none' && (
              <RepeatIcon color="red.500" onClick={handleRepeatIconClick} />
            )}
            <Text
              fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
              color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
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
              {getIntervalLabel(event.repeat.type)}마다
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

export default EventItem;
