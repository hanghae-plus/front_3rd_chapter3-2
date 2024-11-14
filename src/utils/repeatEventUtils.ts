import { Event, EventForm, RepeatType } from '../types';

export const generateRecurringEvents = (eventData: EventForm): Event[] => {
  const { repeat } = eventData;

  // 반복 설정 유효성 검사
  validateRepeatConfiguration(repeat);

  const startDate = new Date(eventData.date);
  const endDate = getEndDate(repeat, startDate);

  const repeatingEvents: Event[] = [];
  let currentDate = new Date(startDate);

  // 반복 일정 생성
  while (currentDate <= endDate) {
    repeatingEvents.push(createEvent(eventData, currentDate));
    currentDate = getNextRepeatDate(currentDate, repeat.type, repeat.interval);
  }

  return repeatingEvents;
};

// 반복 설정이 올바른지 검증하는 함수
const validateRepeatConfiguration = (repeat: { type: RepeatType; endDate?: string }) => {
  if (!repeat || repeat.type === 'none') {
    throw new Error('Invalid repeat configuration');
  }
};

// 종료일을 결정하는 함수
const getEndDate = (repeat: { endDate?: string }, startDate: Date): Date => {
  if (repeat.endDate) {
    return new Date(repeat.endDate);
  }

  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  endDate.setDate(endDate.getDate() - 1);
  return endDate;
};

// 새로운 이벤트 객체를 생성하는 함수
const createEvent = (eventData: EventForm, currentDate: Date): Event => {
  return {
    ...eventData,
    date: currentDate.toISOString().split('T')[0],
    id: '', // ID는 빈 값으로 설정 (실제 API 요청 시 ID 부여)
  };
};

// 반복 일정을 계산하는 함수
const getNextRepeatDate = (currentDate: Date, repeatType: RepeatType, interval: number): Date => {
  const nextDate = new Date(currentDate);
  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * interval);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }
  return nextDate;
};
