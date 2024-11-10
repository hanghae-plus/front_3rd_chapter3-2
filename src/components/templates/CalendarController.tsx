import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import { useCalendarView } from '@hooks/useCalendarView';
import React from 'react';

type PropsType = {};

export const CalendarController: React.FC<PropsType> = () => {
  const { navigate, view, setView } = useCalendarView();
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        data-testid="calendar-prev-btn"
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        data-testid="calendar-view-button"
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton
        data-testid="calendar-next-btn"
        aria-label="Next"
        icon={<ChevronRightIcon />}
        onClick={() => navigate('next')}
      />
    </HStack>
  );
};
