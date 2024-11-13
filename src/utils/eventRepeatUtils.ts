import { EventForm, RepeatInfo } from '../types';

// 매일 반복 일정 생성
export const generateDailyEvents = (
  eventData: EventForm,
  interval: RepeatInfo['interval'],
  endDate?: RepeatInfo['endDate']
) => {
  const events: EventForm[] = [];
  let currentDate = new Date(eventData.date);

  while (!endDate || currentDate <= new Date(endDate)) {
    events.push({
      ...eventData,
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 날짜 설정
    });
    currentDate.setDate(currentDate.getDate() + interval); // interval만큼 날짜를 증가시킴
  }

  return events;
};
