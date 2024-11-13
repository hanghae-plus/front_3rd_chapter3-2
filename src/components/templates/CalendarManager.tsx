import { Heading, VStack } from '@chakra-ui/react';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import React from 'react';

import { Calendar } from './Calendar';
import { CalendarController } from './CalendarController';

export const CalendarManager: React.FC = () => {
  const { isLoading, error } = useFetchEvents();

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) return <div>loading...</div>;
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      {/* week / month 컨트롤 */}
      <CalendarController />

      <Calendar />
    </VStack>
  );
};
