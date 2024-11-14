import { Event } from '../../../entities/event/model/types';
import { EventFormState } from '../../event-form/model/types';

export const findOverlappingEvents = (
  newEvent: EventFormState,
  existingEvents: Event[]
): Event[] => {
  return existingEvents.filter((existingEvent) => {
    // 같은 날짜에 있는 이벤트만 확인
    if (existingEvent.date !== newEvent.date) return false;

    // 수정 중인 이벤트는 제외
    if (existingEvent.id === (newEvent as unknown as Event).id) return false;

    const newStart = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const newEnd = new Date(`${newEvent.date}T${newEvent.endTime}`);
    const existingStart = new Date(`${existingEvent.date}T${existingEvent.startTime}`);
    const existingEnd = new Date(`${existingEvent.date}T${existingEvent.endTime}`);

    // 시간 겹침 체크
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
};
