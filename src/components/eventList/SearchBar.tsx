import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';

export function SearchBar() {
  const { events } = useEventOperations(false);
  const { currentDate, view } = useCalendarView();
  const { searchTerm, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  );
}
