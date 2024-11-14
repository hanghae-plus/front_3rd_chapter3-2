import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/repeatEventUtils';

const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  const showToast = (title: string, status: 'success' | 'error' | 'info') => {
    toast({
      title,
      status,
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('이벤트 로딩 실패', 'error');
    }
  };

  const handleResponse = async (response: Response, successMessage: string) => {
    if (!response.ok) throw new Error(successMessage);
    await fetchEvents();
    onSave?.();
    showToast(successMessage, 'success');
  };

  const createRepeatingEvents = async (eventData: EventForm) => {
    try {
      const repeatingEvents = generateRecurringEvents(eventData);

      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: repeatingEvents }),
      });

      await handleResponse(response, '반복 일정이 추가되었습니다.');
    } catch (error) {
      console.error('Error creating repeating events:', error);
      showToast('반복 일정 생성 실패', 'error');
    }
  };

  const updateRepeatingEvent = async (eventData: Event) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [eventData] }),
      });

      await handleResponse(response, '반복 일정이 수정되었습니다.');
    } catch (error) {
      console.error('Error updating repeating event:', error);
      showToast('반복 일정 수정 실패', 'error');
    }
  };

  const deleteRepeatingEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds: [eventId] }),
      });

      await handleResponse(response, '반복 일정이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting repeating event:', error);
      showToast('반복 일정 삭제 실패', 'error');
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      if (eventData.repeat && eventData.repeat.type !== 'none') {
        // 반복 일정인 경우
        editing
          ? await updateRepeatingEvent(eventData as Event)
          : await createRepeatingEvents(eventData as EventForm);
      } else {
        const method = editing ? 'PUT' : 'POST';
        const url = editing ? `/api/events/${(eventData as Event).id}` : '/api/events';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        await handleResponse(
          response,
          editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.'
        );
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('일정 저장 실패', 'error');
    }
  };

  const deleteEvent = async (id: string, isRepeating?: boolean) => {
    try {
      if (isRepeating) {
        await deleteRepeatingEvent(id);
      } else {
        const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        await handleResponse(response, '일정이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('일정 삭제 실패', 'error');
    }
  };

  useEffect(() => {
    fetchEvents();
    showToast('일정 로딩 완료!', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};

export default useEventOperations;
