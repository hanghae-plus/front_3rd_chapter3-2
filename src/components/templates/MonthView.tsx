import { BellIcon, RepeatClockIcon } from '@chakra-ui/icons';
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
import { useNotifications } from '@hooks/useNotifications';
import { useSearch } from '@hooks/useSearch';
import React, { useCallback } from 'react';

import { WEEK_DAYS } from '../../constants/days';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../../utils/dateUtils';

import { NOTIFICATION_COLORS } from '@/constants/notifications';
import useScheduleForm from '@/stores/useScheduleForm';
import { Event } from '@/types';
import { TEST_ID } from '@/constants/testID';

type PropsType = {
  currentDate: Date;
  holidays: { [key: string]: string };
};
export const MonthView: React.FC<PropsType> = ({ currentDate, holidays }) => {
  const month = getWeeksAtMonth(currentDate);

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
      <Heading size="md">{formatMonth(currentDate)}</Heading>
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
          {month.map((month, monthIndex) => (
            <Tr key={`${month}-${monthIndex}`}>
              {month.map((day, dayIndex) => {
                const dateString = day ? formatDate(currentDate, day) : '';
                const holiday = holidays[dateString];

                return (
                  <Td
                    key={`${day}-${dayIndex}`}
                    height="100px"
                    verticalAlign="top"
                    width="14.28%"
                    position="relative"
                    p={2}
                    data-testid={`calendar-${dateString}`}
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text bg="red.500" color="white" fontSize="sm" px={1}>
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(filteredEvents, formatDate(currentDate, day)).map(
                          (event) => {
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
                                onClick={() => setEditingForm(event, formatDate(currentDate, day))}
                              >
                                {isRepeat && (
                                  <Text color="red.400">
                                    <RepeatClockIcon />
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
                      </>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};
