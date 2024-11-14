import { useCreateEvent } from './events/useCreateEvent';
import { useDeleteEvent } from './events/useDeleteEvent';
import { useFetchEvents } from './events/useFetchEvents';
import { useUpdateEvent } from './events/useUpdateEvent';

export const useEventOperations = () => {
  const fetch = useFetchEvents();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const deleted = useDeleteEvent();
  return { fetch, create, update, deleted };
};
