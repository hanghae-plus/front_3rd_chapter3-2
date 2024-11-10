import { BellIcon, DeleteIcon, EditIcon, IconButton, Text } from '@chakra-ui/icons';

import { notificationOptions } from '../../../shared/config/constant';
import { Flex as Box } from '../../../shared/ui/Flex';
import { HStack, VStack } from '../../../shared/ui/Stack';
import { Event } from '../model/types';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventCard = ({ event, isNotified, onEdit, onDelete }: EventCardProps) => {
  return (
    <Box borderWidth={1} borderRadius="lg" p={3} width="100%">
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
          {event.description && <Text>{event.description}</Text>}
          {event.location && <Text>{event.location}</Text>}
          {event.category && <Text>카테고리: {event.category}</Text>}
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
            {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
          </Text>
        </VStack>
        <HStack>
          <IconButton aria-label="Edit event" icon={<EditIcon />} onClick={() => onEdit(event)} />
          <IconButton
            aria-label="Delete event"
            icon={<DeleteIcon />}
            onClick={() => onDelete(event.id)}
          />
        </HStack>
      </HStack>
    </Box>
  );
};
