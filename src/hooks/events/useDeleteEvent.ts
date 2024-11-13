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

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventMutation.mutateAsync(id);
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
    deleteEvent,
    isSuccess: deleteEventMutation.isSuccess,
    isError: deleteEventMutation.isError,
  };
};
