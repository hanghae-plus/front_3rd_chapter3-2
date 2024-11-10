import { useQuery } from '@tanstack/react-query';

import { fetchHolidays } from '../../../apis/fetchHolidays';

export function useGetHolidays(date: Date) {
  return useQuery({
    queryKey: ['holidays', date],
    queryFn: () => fetchHolidays(date),
  });
}
