import { updateEvents } from '@apis/events/updateEvents';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from 'src/types';

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateEventMutation = useMutation({
    mutationFn: updateEvents,
    onSuccess: (data: Event) => {
      queryClient.setQueryData(['events'], (oldData: Event[]) => {
        const filteredData = oldData.filter((old) => old.id !== data.id);
        return [...filteredData, data];
      });
      toast({
        title: '일정이 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateEvent = (event: Event) => updateEventMutation.mutate(event);
  // const updateEvent = (event: Event) => updateEventMutation.mutate({ ...event, id: 'a35sd1' });

  return { updateEvent };
};
