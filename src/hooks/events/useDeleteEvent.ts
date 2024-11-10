import { deleteEventApi } from '@apis/events/deleteEventApi';
import { useToast } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';

export const useDeleteEvent = () => {
  const toast = useToast();

  const deleteEventMutation = useMutation({
    mutationFn: deleteEventApi,
    onSuccess: () => {
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteEvent = (id: string) => deleteEventMutation.mutate(id);

  return { deleteEvent };
};
