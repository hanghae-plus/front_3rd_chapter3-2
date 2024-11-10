import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select } from '@chakra-ui/react';

import { useCombinedContext } from '../../../provider';

export function CalendarHeader() {
  const { view, setView, navigate } = useCombinedContext();

  return (
    <>
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
    </>
  );
}
