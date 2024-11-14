import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, Select, IconButton } from '@chakra-ui/react';

interface NavigationProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ view, onViewChange, onNavigate }: NavigationProps) => {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => onNavigate('prev')}
      />
      <Select
        aria-label="view"
        value={view}
        onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon />}
        onClick={() => onNavigate('next')}
      />
    </HStack>
  );
};
