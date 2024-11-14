import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const saveEventList = async (eventData: Event | EventForm) => {
    try {
      const startDate = new Date(eventData.date);
      const endDate = eventData.repeat.endDate
        ? new Date(eventData.repeat.endDate)
        : new Date('2025-10-16');
      const interval = eventData.repeat.interval || 1;

      const eventLists = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const newEvent = {
          ...eventData,
          repeat: {
            ...eventData.repeat,
            type: eventData.repeat.type === 'none' ? 'daily' : eventData.repeat.type,
          },
        };
        if (editing) {
          // eslint-disable-next-line no-unused-vars
          const { id: _, ...eventWithoutId } = newEvent as Event;
          Object.assign(newEvent, eventWithoutId);
        }
        newEvent.date = currentDate.toISOString().split('T')[0];
        eventLists.push(newEvent);

        if (eventData.repeat.type === 'daily') {
          currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
        } else if (eventData.repeat.type === 'weekly') {
          currentDate = new Date(currentDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
        } else if (eventData.repeat.type === 'monthly') {
          const newMonth = currentDate.getMonth() + interval;
          currentDate = new Date(currentDate.setMonth(newMonth));
        } else if (eventData.repeat.type === 'yearly') {
          const newYear = currentDate.getFullYear() + interval;
          currentDate = new Date(currentDate.setFullYear(newYear));
        } else {
          currentDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);
        }
      }

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventLists }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      if (editing) {
        const deleteResponse = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete event');
        }
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
    try {
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

  return { events, fetchEvents, saveEvent, deleteEvent, saveEventList };
};
