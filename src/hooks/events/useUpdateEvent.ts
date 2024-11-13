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

  const updateEvent = async (event: Event) => {
    try {
      await updateEventMutation.mutateAsync(event);
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
    updateEvent,
    isSuccess: updateEventMutation.isSuccess,
    isError: updateEventMutation.isError,
  };
};
