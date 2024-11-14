import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { createRepeatEvents } from '../utils/eventUtils';

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

  const saveEvent = async (eventData: Event | EventForm) => {
    const isRepeatEvent = eventData.repeat.type !== 'none';

    try {
      let response;
      if (editing) {
        if (isRepeatEvent) {
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...eventData,
              repeat: {
                type: 'none',
                interval: 1,
              },
            }),
          });
        } else {
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }

        // TODO: 기존 일정은 수정하고, 새로운 반복 일정 등록(기존 일정과 동일한 날짜는 제거)
      } else {
        // 반복일정이 아닐 경우
        if (!isRepeatEvent) {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        } else {
          // 반복일정일 경우
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: createRepeatEvents(eventData) }),
          });
        }
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

  const deleteEvent = async (id: string) => {
    try {
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
