import { useToast } from '@chakra-ui/react';
import { useState } from 'react';

export const useDeleteAllEvents = (resetForm: () => void, setEditingEvent: (event: null) => void) => {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAllEvents = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:3000/api/events');
      if (!response.ok) {
        throw new Error('이벤트를 가져오는 데 실패했습니다.');
      }
      const { events } = await response.json();
      const eventIds = events.map((event: { id: string }) => event.id);

      const deleteResponse = await fetch('http://localhost:3000/api/events-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds }),
      });

      if (deleteResponse.ok) {
        toast({
          title: '모든 일정이 삭제되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingEvent(null);
        resetForm();
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      toast({
        title: '일정 삭제 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAllEvents, isDeleting };
}; 