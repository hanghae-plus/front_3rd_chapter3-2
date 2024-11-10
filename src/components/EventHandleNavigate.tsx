import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import React from 'react';

interface EventHandleNavigateProps {
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  // eslint-disable-next-line no-unused-vars
  navigate: (direction: 'prev' | 'next') => void;
}

export const EventHandleNavigate = ({ view, setView, navigate }: EventHandleNavigateProps) => {
  return (
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
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={() => navigate('next')} />
    </HStack>
  );
};
