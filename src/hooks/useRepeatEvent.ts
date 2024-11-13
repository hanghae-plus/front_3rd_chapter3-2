import { useState } from 'react';

import { Event } from '../types';

export const useRepeatEvent = () => {
  const [repeatEvent, setRepeatEvent] = useState<Event[]>([]);

  // 반복일정 상태저장
  const updateRepeatEvent = (events: Event[]) => {
    setRepeatEvent(events);
  };

  //일정의 반복일정 개별삭제
  // eslint-disable-next-line no-unused-vars
  const deleteRepeatInstance = (repeatId: string, deleteEvent: (id: string) => void) => {
    setRepeatEvent((prev) => expectTargetRepeat(prev, repeatId));
    deleteEvent(repeatId);
  };

  const expectTargetRepeat = (prev: Event[], repeatId: string) => {
    const repeatEvents = prev.filter((event) => event.id !== repeatId);
    return repeatEvents;
  };

  return { repeatEvent, updateRepeatEvent, deleteRepeatInstance };
};
