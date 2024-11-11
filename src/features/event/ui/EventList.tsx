import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';

interface EventListProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export const EventList = ({
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventListProps) => {
  if (!filteredEvents?.length) return <Text>검색 결과가 없습니다.</Text>;

  return (
    filteredEvents &&
    filteredEvents.map((event) => (
      <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
        <HStack justifyContent="space-between">
          <VStack align="start">
            <HStack>
              {notifiedEvents?.includes(event.id) && <BellIcon color="red.500" />}
              <Text
                fontWeight={notifiedEvents?.includes(event.id) ? 'bold' : 'normal'}
                color={notifiedEvents?.includes(event.id) ? 'red.500' : 'inherit'}
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
    ))
  );
};
