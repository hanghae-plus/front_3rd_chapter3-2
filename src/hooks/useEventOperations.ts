import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { createRepeatEvent } from '../utils/createRepeatEvent';

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
      displayToastNotification('이벤트 로딩 실패', 'error');
    }
  };

  const displayToastNotification = (title: string, status: 'success' | 'error' | 'info') => {
    toast({
      title,
      status,
      duration: 3000,
      isClosable: true,
    });
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      const response = await (editing ? updateEvent(eventData) : createEvent(eventData));

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      displayToastNotification(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', 'success');
    } catch (error) {
      console.error('Error saving event:', error);
      displayToastNotification('일정 저장 실패', 'error');
    }
  };

  const updateEvent = (eventData: Event | EventForm) => {
    const editingEvent = {
      ...eventData,
      repeat: eventData.repeat ?? {
        type: 'none',
        interval: 0,
        endDate: '',
      },
    };

    return fetch(`/api/events/${(eventData as Event).id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingEvent),
    });
  };

  const createEvent = (eventData: Event | EventForm) => {
    return fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      displayToastNotification('일정이 삭제되었습니다.', 'info');
    } catch (error) {
      console.error('Error deleting event:', error);
      displayToastNotification('일정 삭제 실패', 'error');
    }
  };

  async function init() {
    await fetchEvents();
    displayToastNotification('일정 로딩 완료!', 'info');
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRepeatEvents = async (eventData: EventForm) => {
    try {
      const newEvents = createRepeatEvent(eventData as Event);
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: newEvents }),
      });

      if (!response.ok) {
        throw new Error('일정 저장 실패');
      }

      await fetchEvents();
      onSave?.();
      displayToastNotification('일정이 추가되었습니다.', 'success');
    } catch (error) {
      console.error('Error saving event:', error);
      displayToastNotification('일정 저장 실패', 'error');
      await fetchEvents();
    }
  };

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    saveRepeatEvents,
  };
};