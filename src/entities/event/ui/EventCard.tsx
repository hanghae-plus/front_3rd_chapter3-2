import {
  BellIcon,
  DeleteIcon,
  EditIcon,
  RepeatIcon,
  InfoIcon,
  TimeIcon,
  CalendarIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { IconButton, Text, Badge, Tooltip, useColorModeValue } from '@chakra-ui/react';

import { notificationOptions } from '../../../shared/config/constant';
import { Flex as Box } from '../../../shared/ui/Flex';
import { HStack, VStack } from '../../../shared/ui/Stack';
import { Event } from '../model/types';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string, isRecurringEvent: boolean) => void;
}

export const EventCard = ({ event, isNotified, onEdit, onDelete }: EventCardProps) => {
  const badgeBg = useColorModeValue('blue.100', 'blue.800');
  const badgeColor = useColorModeValue('blue.800', 'blue.100');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 반복 일정 정보 포맷팅
  const getRepeatText = () => {
    if (!event.isRepeating || event.repeat.type === 'none') return null;

    const intervalText = `${event.repeat.interval}${
      event.repeat.type === 'daily'
        ? '일'
        : event.repeat.type === 'weekly'
          ? '주'
          : event.repeat.type === 'monthly'
            ? '개월'
            : '년'
    }마다`;

    const endText =
      event.repeat.endCondition === 'date'
        ? `(${event.repeat.endDate}까지)`
        : event.repeat.endCondition === 'count'
          ? `(${event.repeat.count}회)`
          : '(종료 없음)';

    return `${intervalText} ${endText}`;
  };

  // 날짜가 윤년이나 말일인 경우 툴팁 텍스트
  const getSpecialDateText = () => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.getMonth();

    if (day === 31) {
      return '매월 말일에 반복';
    } else if (day === 29 && month === 1) {
      return '윤년이 아닌 경우 2월 28일에 반복';
    }
    return null;
  };

  const handleDelete = () => {
    onDelete(event.id, event.isRepeating);
  };

  return (
    <Box
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      width="100%"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <VStack spacing={3} align="stretch">
        {/* 헤더 영역 */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <HStack spacing={2} flex={1}>
            <Text fontSize="lg" fontWeight="bold">
              {event.title}
            </Text>
            {event.isRepeating && (
              <Tooltip label={getRepeatText()}>
                <RepeatIcon boxSize={18} color={iconColor} />
              </Tooltip>
            )}
            {isNotified && (
              <Tooltip label="알림 예정">
                <BellIcon boxSize={18} color="red" />
              </Tooltip>
            )}
          </HStack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit event"
              icon={<EditIcon boxSize={18} />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(event)}
            />
            <IconButton
              aria-label="Delete event"
              icon={<DeleteIcon boxSize={18} />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
            />
          </HStack>
        </HStack>

        {/* 본문 영역 */}
        <VStack spacing={2} align="stretch">
          <HStack spacing={2}>
            <CalendarIcon boxSize={18} color={iconColor} />
            <Text>{event.date}</Text>
          </HStack>

          <HStack spacing={2}>
            <TimeIcon boxSize={18} color={iconColor} />
            <Text>
              {event.startTime} - {event.endTime}
            </Text>
          </HStack>

          <HStack spacing={2}>
            {event.description && <Text color="gray.600">{event.description}</Text>}
          </HStack>

          {event.location && (
            <HStack spacing={2}>
              <InfoIcon boxSize={18} color={iconColor} />
              <Text>{event.location}</Text>
            </HStack>
          )}

          {event.category && (
            <HStack spacing={2}>
              <SettingsIcon boxSize={18} color={iconColor} />
              <Text>{event.category}</Text>
            </HStack>
          )}

          {/* 반복 일정 정보 */}
          {event.isRepeating && (
            <Box>
              <Badge bg={badgeBg} color={badgeColor} px={2} py={1} borderRadius="full">
                {getRepeatText()}
              </Badge>
              {getSpecialDateText() && (
                <Text fontSize="sm" color="orange.500" mt={1}>
                  {getSpecialDateText()}
                </Text>
              )}
            </Box>
          )}

          {/* 알림 설정 */}
          <HStack spacing={2}>
            <BellIcon boxSize={18} color={iconColor} />
            <Text>
              {notificationOptions.find((option) => option.label === event.notificationTime)?.label}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};
