import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 반복 일정 생성 함수 추가
  const createRepeatingEvents = async (eventData: EventForm) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [eventData] }),
      });

      if (!response.ok) {
        throw new Error('Failed to create repeating events');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: '반복 일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating repeating events:', error);
      toast({
        title: '반복 일정 생성 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 반복 일정 수정 함수 추가
  const updateRepeatingEvent = async (eventData: Event) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [eventData] }),
      });

      if (!response.ok) {
        throw new Error('Failed to update repeating event');
      }

      await fetchEvents();
      onSave?.();
      toast({
        title: '반복 일정이 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating repeating event:', error);
      toast({
        title: '반복 일정 수정 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 반복 일정 삭제 함수 추가
  const deleteRepeatingEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds: [eventId] }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete repeating event');
      }

      await fetchEvents();
      toast({
        title: '반복 일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting repeating event:', error);
      toast({
        title: '반복 일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      if (eventData.repeat && eventData.repeat.type !== 'none') {
        // 반복 일정인 경우
        if (editing) {
          await updateRepeatingEvent(eventData as Event);
        } else {
          await createRepeatingEvents(eventData as EventForm);
        }
      } else {
        let response;
        if (editing) {
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        } else {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }

        if (!response.ok) {
          throw new Error('Failed to save event');
        }

        await fetchEvents();
        onSave?.();
        toast({
          title: editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id: string, isRepeating: boolean) => {
    try {
      if (isRepeating) {
        await deleteRepeatingEvent(id);
      } else {
        const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
  
        await fetchEvents();
        toast({
          title: '일정이 삭제되었습니다.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }     
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  async function init() {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
