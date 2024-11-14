import { createEvents } from '@apis/events/createEvents';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Event, EventForm } from 'src/types';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createEventMutation = useMutation({
    mutationFn: createEvents,
    onSuccess: (data: Event) => {
      queryClient.setQueryData(['events'], (oldData: Event[] = []) => [...oldData, data]);
      toast({
        title: '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createEvent = async (event: EventForm) => {
    try {
      await createEventMutation.mutateAsync(event);
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청 처리 중 알 수 없는 오류 발생';

      toast({
        title: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    createEvent,
    isSuccess: createEventMutation.isSuccess,
    isError: createEventMutation.isError,
  };
};
