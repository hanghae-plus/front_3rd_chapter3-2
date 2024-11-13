import { useState } from 'react';

import { Event } from '../types';

export const useRepeatEvent = () => {
  const [repeatEvent, setRepeatEvent] = useState<Event[]>([]);

  // 반복일정 상태저장
  const updateRepeatEvent = (events: Event[]) => {
    setRepeatEvent(events);
  };

  //일정의 반복일정 개별삭제
  const deleteRepeatInstance = (eventId: string, repeatId: string) => {};

  return { repeatEvent, updateRepeatEvent, deleteRepeatInstance };
};
