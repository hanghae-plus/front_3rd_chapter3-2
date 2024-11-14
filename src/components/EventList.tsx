import { EditIcon, DeleteIcon, BellIcon } from '@chakra-ui/icons';
import {
  VStack,
  Box,
  HStack,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';

import { Event } from '../types';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventList = ({
  events,
  notifiedEvents,
  searchTerm,
  setSearchTerm,
  onEditEvent,
  onDeleteEvent,
}: EventListProps) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto" spacing={4}>
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {events.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        events.map((event) => (
          <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
            <HStack justifyContent="space-between">
              <VStack align="start">
                <HStack>
                  {notifiedEvents.includes(event.id!) && <BellIcon color="red.500" />}
                  <Text
                    fontWeight={notifiedEvents.includes(event.id!) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id!) ? 'red.500' : 'inherit'}
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
                    notificationOptions.find((option) => option.value === event.notificationTime)
                      ?.label
                  }
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  aria-label="Edit event"
                  icon={<EditIcon />}
                  onClick={() => onEditEvent(event)}
                />
                <IconButton
                  aria-label="Delete event"
                  icon={<DeleteIcon />}
                  onClick={() => onDeleteEvent(event.id!)}
                />
              </HStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
};
