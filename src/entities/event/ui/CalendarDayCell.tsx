import { BellIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, HStack, Text, BoxProps } from '@chakra-ui/react';

import { Event } from '@/types';

interface CalendarDayCellProps {
  event: Event;
  isNotified: boolean;
  isRepeatEvent: boolean;
}

const getCellStyles = (isNotified: boolean, isRepeatEvent: boolean): BoxProps => ({
  p: 1,
  my: 1,
  borderRadius: 'md',
  bg: isNotified ? 'red.100' : isRepeatEvent ? 'purple.100' : 'gray.100',
  fontWeight: isNotified || isRepeatEvent ? 'bold' : 'normal',
  color: isNotified ? 'red.500' : isRepeatEvent ? 'purple.500' : 'inherit',
});

export const CalendarDayCell = ({ event, isNotified, isRepeatEvent }: CalendarDayCellProps) => {
  const cellStyles = getCellStyles(isNotified, isRepeatEvent);

  return (
    <Box {...cellStyles}>
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        {isRepeatEvent && (
          <div>
            <RepeatIcon />
            <span style={{ opacity: 0, pointerEvents: 'none', position: 'absolute' }}>
              {`반복 일정 캘린더 ${event.date}`}
            </span>
          </div>
        )}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
