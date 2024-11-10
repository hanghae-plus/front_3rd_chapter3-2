import { readEvents } from '@apis/events/readEvents';
import { useQuery } from '@tanstack/react-query';
import { Event } from 'src/types';

export const useFetchEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: readEvents,
    staleTime: 0,
    select: (data) =>
      data.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    refetchOnMount: false,
  });

  if (isLoading || error) return { events: [], isLoading, error };

  return {
    events: data,
    isLoading: false,
    error,
  };
};
