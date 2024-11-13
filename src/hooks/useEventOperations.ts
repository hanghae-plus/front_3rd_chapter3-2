import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { eventApi } from '../apis/eventApi';
import { Event, EventForm, EventId } from '../types';

const isEvent = (eventData: Event | EventForm): eventData is Event => {
  return (eventData as Event).id !== undefined;
};

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast({ duration: 3000, isClosable: true });

  // 이벤트 가져오기
  const fetchEvents = async () => {
    try {
      const events = await eventApi.fetchEvents();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
      });
    }
  };

  // 이벤트 저장 (추가, 수정)
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      const isEditing = editing && isEvent(eventData);

      if (isEditing) {
        await eventApi.editEvent(eventData);
        toast({
          title: '일정이 수정되었습니다.',
          status: 'success',
        });
      } else {
        await eventApi.addEvent(eventData);
        toast({
          title: '일정이 추가되었습니다.',
          status: 'success',
        });
      }
      await fetchEvents();
      onSave?.();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
      });
    }
  };

  // 이벤트 삭제
  const deleteEvent = async (id: EventId) => {
    try {
      await eventApi.deleteEvent(id);
      await fetchEvents();
      toast({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
      });
    }
  };

  // 초기화
  const init = async () => {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
