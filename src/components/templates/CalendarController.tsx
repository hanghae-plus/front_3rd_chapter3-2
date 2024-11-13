import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import { useCalendarView } from '@hooks/useCalendarView';
import React from 'react';

import { TEST_ID } from '@/__tests__/constants';

type PropsType = {};

export const CalendarController: React.FC<PropsType> = () => {
  const { navigate, view, setView } = useCalendarView();
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        data-testid={TEST_ID.PREV}
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        data-testid={TEST_ID.VIEW}
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton
        data-testid={TEST_ID.NEXT}
        aria-label="Next"
        icon={<ChevronRightIcon />}
        onClick={() => navigate('next')}
      />
    </HStack>
  );
};
