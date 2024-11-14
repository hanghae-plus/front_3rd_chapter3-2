import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatingEvents } from './useGenerateRepeatingEvents';

export const useEventOperations = (editing: boolean, currentDate: Date, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');

      const { events: fetchedEvents } = await response.json();
      const processedEvents = fetchedEvents.flatMap((event: Event) => {
        if (event.repeat?.type !== 'none' && event.repeat?.endDate) {
          return generateRepeatingEvents(event, event.repeat.endDate);
        }
        return [event];
      });

      setEvents(processedEvents);
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
    try {
      let response;
      const isRecurringEvent = 'originalStartDate' in eventData;

      // 반복 일정 수정 시 단일 일정으로 변환
      const payload = {
        ...eventData,
        repeat: isRecurringEvent ? { type: 'none', interval: 0 } : eventData.repeat,
      };

      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to save event');

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

  const deleteEvent = async (id: string, event?: Event) => {
    try {
      const payload = event?.originalStartDate
        ? { ...event, repeat: { type: 'none', interval: 0 } }
        : undefined;

      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        ...(payload && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete event');

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
  }, [currentDate]);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
