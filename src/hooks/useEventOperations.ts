import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { eventApi } from '../apis/eventApi';
import { DEFAULT_REPEAT_INFO, Event, EventForm, EventId } from '../types';
import { generateRepeatedEvents } from '../utils/RepeatedEventUtils';

const isEvent = (eventData: Event | EventForm): eventData is Event => {
  return (eventData as Event).id !== undefined;
};

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const toast = useToast({ duration: 3000, isClosable: true });

  /** 이벤트 가져오기 */
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

  /** 단일 이벤트 저장 */
  const saveSingleEvent = async (eventData: Event | EventForm) => {
    const isEditing = editing && isEvent(eventData);
    const successMessage = isEditing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.';

    isEditing //
      ? await eventApi.editEvent(eventData)
      : await eventApi.addEvent(eventData);

    toast({
      title: successMessage,
      status: 'success',
    });
  };

  /** 반복 이벤트 저장 */
  const saveRepeatedEvent = async (eventData: Event | EventForm) => {
    const isEditing = editing && isEvent(eventData);

    // 반복 이벤트를 수정하면 단일 일정으로 변경
    if (isEditing) {
      const singleEvent: Event = { ...eventData, repeat: DEFAULT_REPEAT_INFO };
      await saveSingleEvent(singleEvent);
      return;
    }

    const repeatedEvents: EventForm[] = generateRepeatedEvents(eventData);
    await eventApi.addEventList(repeatedEvents);
  };

  /** 이벤트 저장 */
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      if (eventData.repeat.type !== 'none') {
        await saveRepeatedEvent(eventData);
      } else {
        await saveSingleEvent(eventData);
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

  /** 이벤트 삭제 */
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

  /** 초기화 */
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
