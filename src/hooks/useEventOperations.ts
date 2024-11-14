/* eslint-disable no-unused-vars */
import { useToast } from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { getRepeatingEvent } from '../utils/repeatEventUtils';

export const useEventOperations = (
  editing: boolean,
  updateRepeatEvent: (events: Event[]) => void,
  onSave?: () => void
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast();

  // db에서 가져올 때 메인이벤트와 반복이벤트를 나누어 상태에 저장
  const fetchEvents = async () => {
    try {
      const response: AxiosResponse<{ events: Event[] }> = await axios.get('/api/events');
      if (response.status !== 200) {
        throw new Error('Failed to fetch events');
      }

      const { data } = response;
      const mainEvents = data.events.filter((event) => event.repeat.id === undefined);
      const repeatEvent = data.events.filter((event) => event.repeat.id !== undefined);

      setEvents(mainEvents);
      updateRepeatEvent(repeatEvent);
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

  const saveEvent = async (eventData: Event | EventForm, exceptDate?: string) => {
    const requestBody = { ...eventData };
    try {
      let response;
      if (editing) {
        if (requestBody.repeat.id !== undefined) {
          delete requestBody.repeat.id;
        }
        response = await axios.put(`/api/events/${(requestBody as Event).id}`, requestBody);
      } else {
        response = await axios.post('api/events', requestBody);
      }

      if (response.status !== 200 && response.status !== 201) {
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

    // repeat type 이 존재할 때 repeatEvent도 저장
    if (requestBody.repeat.type !== 'none') {
      const repeatEvents = getRepeatingEvent(requestBody, exceptDate);

      saveRepeatEvent(repeatEvents);
    }
  };

  const saveRepeatEvent = async (eventData: Event[] | EventForm[]) => {
    try {
      const requestBody = { events: eventData };
      const response = await axios.post('/api/events-list', requestBody);
      if (response.status !== 201) {
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
        title: '반복일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await axios.delete(`/api/events/${id}`, { method: 'DELETE' });

      if (response.status !== 204) {
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

  return { events, fetchEvents, saveEvent, saveRepeatEvent, deleteEvent };
};
