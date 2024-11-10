import { BellIcon } from '@chakra-ui/icons';
import { Tr, Td, Box, HStack, Text } from '@chakra-ui/react';

import { useCombinedContext } from '../../../provider';
import { formatDate, getEventsForDay, getWeeksAtMonth } from '../../../utils/dateUtils';

export function ViewMonth() {
  const { currentDate, holidays, filteredEvents, notifiedEvents } = useCombinedContext();
  const weeks = getWeeksAtMonth(currentDate);
  return (
    <>
      {weeks.map((week, weekIndex) => (
        <Tr key={weekIndex}>
          {week.map((day, dayIndex) => {
            const dateString = day ? formatDate(currentDate, day) : '';
            const holiday = holidays[dateString as keyof typeof holidays];

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
    </>
  );
}
