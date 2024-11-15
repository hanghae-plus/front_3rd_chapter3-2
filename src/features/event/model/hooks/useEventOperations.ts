import { useToast } from '@chakra-ui/react';
import { Event, EventForm } from '@entities/event/model/types';
import { useEventFormStore } from '@features/event/model/stores';
import { generateRepeatedEvents } from '@features/event/model/utils';
import { useEffect, useState } from 'react';

export const useEventOperations = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const { setEditingEvent } = useEventFormStore();

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

  const createRepeatEvents = async (events: Omit<Event, 'id'>[]) => {
    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error('Failed to save event');
    }
  };

  const saveEvent = async (eventData: Event | EventForm, isEditing: boolean) => {
    try {
      let response;
      if (isEditing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        toast({
          title: '일정이 수정되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        if (eventData.repeat.type !== 'none') {
          const repeatedEvents = generateRepeatedEvents(eventData);
          await createRepeatEvents(repeatedEvents);
          await fetchEvents();
          setEditingEvent(null);

          toast({
            title: '일정이 추가되었습니다.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          return;
        }

        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        toast({
          title: '일정이 추가되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();

      setEditingEvent(null);
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

  const deleteAllEvents = async () => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventIds: events.map((event) => event.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete all events');
      }

      toast({
        title: '모든 일정을 삭제했습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting all events:', error);
      toast({
        title: '일정 삭제 실패',
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

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    deleteAllEvents,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    setOverlappingEvents,
  };
};
