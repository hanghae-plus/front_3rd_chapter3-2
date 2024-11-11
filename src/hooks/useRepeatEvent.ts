import { useState } from 'react';

import { Event, RepeatEvent } from '../types';

export const useRepeatEvent = (events: Event[]) => {
  const [repeatEvent, setRepeatEvent] = useState<RepeatEvent[]>([]);

  // 반복일정을 전체 변경
  const changeRepeatEvent = () => {};

  // 일정의 반복일정 전체를 삭제
  const deleteRepeatEvent = () => {};

  //일정의 반복일정 개별삭제
  const deleteRepeatEventInstance = () => {};

  return { repeatEvent, changeRepeatEvent, deleteRepeatEvent, deleteRepeatEventInstance };
};
