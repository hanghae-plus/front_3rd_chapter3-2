import { BellIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import React from 'react';

import { Event, EventId } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  notifiedEvents: EventId[];

  filteredEvents: Event[];

  currentDate: Date;
  holidays: {
    [key: string]: string;
  };
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  navigate: (direction: 'prev' | 'next') => void;
};

export const Calendar = ({
  filteredEvents,
  notifiedEvents,

  currentDate,
  holidays,
  view,
  setView,
  navigate,
}: Props) => {
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
        <Heading size="md">{formatWeek(currentDate)}</Heading>
        <Table variant="simple" w="full">
          <Thead>
            <Tr>
              {weekDays.map((day) => (
                <Th key={day} width="14.28%">
                  {day}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              {weekDates.map((date) => (
                <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                  <Text fontWeight="bold">{date.getDate()}</Text>
                  {filteredEvents
                    .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                    .map((event) => {
                      const isNotified = notifiedEvents.includes(event.id);
                      return (
                        <Box
                          key={event.id}
                          p={1}
                          my={1}
                          bg={isNotified ? 'red.100' : 'gray.100'}
                          borderRadius="md"
                          fontWeight={isNotified ? 'bold' : 'normal'}
                          color={isNotified ? 'red.500' : 'inherit'}
                        >
                          <HStack spacing={1}>
                            {isNotified && <BellIcon />}
                            <Text fontSize="sm" noOfLines={1}>
                              {event.title}
                            </Text>
                          </HStack>
                        </Box>
                      );
                    })}
                </Td>
              ))}
            </Tr>
          </Tbody>
        </Table>
      </VStack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
        <Heading size="md">{formatMonth(currentDate)}</Heading>
        <Table variant="simple" w="full">
          <Thead>
            <Tr>
              {weekDays.map((day) => (
                <Th key={day} width="14.28%">
                  {day}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {weeks.map((week, weekIndex) => (
              <Tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dateString = day ? formatDate(currentDate, day) : '';
                  const holiday = holidays[dateString];

                  return (
                    <Td
                      key={dayIndex}
                      height="100px"
                      verticalAlign="top"
                      width="14.28%"
                      position="relative"
                    >
                      {day && (
                        <>
                          <Text fontWeight="bold">{day}</Text>
                          {holiday && (
                            <Text color="red.500" fontSize="sm">
                              {holiday}
                            </Text>
                          )}
                          {getEventsForDay(filteredEvents, day).map((event) => {
                            const isNotified = notifiedEvents.includes(event.id);
                            return (
                              <Box
                                key={event.id}
                                p={1}
                                my={1}
                                bg={isNotified ? 'red.100' : 'gray.100'}
                                borderRadius="md"
                                fontWeight={isNotified ? 'bold' : 'normal'}
                                color={isNotified ? 'red.500' : 'inherit'}
                              >
                                <HStack spacing={1}>
                                  {isNotified && <BellIcon />}
                                  <Text fontSize="sm" noOfLines={1}>
                                    {event.title}
                                  </Text>
                                </HStack>
                              </Box>
                            );
                          })}
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

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => navigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => navigate('next')}
        />
      </HStack>

      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </VStack>
  );
};
