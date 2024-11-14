import { BellIcon, NotAllowedIcon, RepeatClockIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { WEEK_DAYS } from '@constants/days';
import { useNotifications } from '@hooks/useNotifications';
import { useSearch } from '@hooks/useSearch';
import { formatDate, formatWeek, getEventsForDay, getWeekDates } from '@utils/dateUtils';
import React, { useCallback } from 'react';

import { NOTIFICATION_COLORS } from '@/constants/notifications';
import useScheduleForm from '@/stores/useScheduleForm';
import { Event } from '@/types';
import { TEST_ID } from '@/constants/testID';

type PropsType = {
  currentDate: Date;
  holidays: { [key: string]: string };
};

export const WeekView: React.FC<PropsType> = ({ currentDate, holidays }) => {
  const weekDates = getWeekDates(currentDate);

  const { filteredEvents } = useSearch();
  const { notifiedEvents } = useNotifications();

  const setForm = useScheduleForm((state) => state.setForm);

  const setEditingForm = useCallback(
    (event: Event, date: string) => setForm({ ...event, date }),
    [setForm]
  );

  const scheduleBg = (isNotified: boolean, isRepeat: boolean, event: Event) => {
    if (isNotified) return 'red.100';
    if (isRepeat)
      return NOTIFICATION_COLORS[filteredEvents.indexOf(event) % NOTIFICATION_COLORS.length];
    return 'gray.100';
  };

  return (
    <VStack align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {WEEK_DAYS.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody data-testid={TEST_ID.CALENDAR_UI}>
          <Tr>
            {weekDates.map((date) => {
              const dateString = date.getDate() ? formatDate(currentDate, date.getDate()) : '';
              const holiday = holidays[dateString];

              return (
                <Td
                  key={date.toISOString()}
                  height="100px"
                  verticalAlign="top"
                  width="14.28%"
                  data-testid={`calendar-${dateString}`}
                >
                  <Text fontWeight="bold">{date.getDate()}</Text>
                  {holiday && (
                    <Text bg="red.500" color="white" fontSize="sm" px={1}>
                      {holiday}
                    </Text>
                  )}

                  {getEventsForDay(filteredEvents, formatDate(currentDate, date.getDate())).map(
                    (event) => {
                      const fomattedDate = formatDate(currentDate, date.getDate());
                      const isNotified = notifiedEvents.has(event.id);
                      const isRepeat = event.repeat.type !== 'none';
                      return (
                        <Box
                          key={`${event.id}-${event.date}`}
                          p={1}
                          my={1}
                          bg={scheduleBg(isNotified, isRepeat, event)}
                          borderRadius="md"
                          fontWeight={isNotified || isRepeat ? 'bold' : 'normal'}
                          color={isNotified ? 'red.500' : 'inherit'}
                          cursor="pointer"
                          onClick={() => setEditingForm(event, fomattedDate)}
                        >
                          {isRepeat && (
                            <Text color="red.400">
                              {event.repeat.endDate === fomattedDate ? (
                                <>
                                  <NotAllowedIcon />
                                  반복 종료
                                </>
                              ) : (
                                <RepeatClockIcon />
                              )}
                              {event.repeat.type}
                            </Text>
                          )}
                          <HStack spacing={1}>
                            {isNotified && <BellIcon />}
                            <Text fontSize="sm" noOfLines={1}>
                              {event.title}
                            </Text>
                          </HStack>
                        </Box>
                      );
                    }
                  )}
                </Td>
              );
            })}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
