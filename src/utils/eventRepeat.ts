import { Event } from '../types';
import { formatDate, isLeapYear } from './dateUtils';

const getMonthlyNextEventDate = (currentDate: Date, interval: number): Date => {
  const currentDay = currentDate.getDate();
  let targetMonth = currentDate.getMonth();
  let targetYear = currentDate.getFullYear();

  // 다음 달로 이동
  targetMonth += interval;
  if (targetMonth > 11) {
    targetYear++;
    targetMonth -= 12;
  }

  // 날짜가 이전 달로 넘어갔다면 (즉, 해당 월에 그 날짜가 없는 경우)
  // 다음 interval에서 해당 날짜가 있는 달을 찾음
  let remainingInterval = interval;

  while (
    new Date(targetYear, targetMonth, currentDay).getMonth() !== targetMonth &&
    remainingInterval > 0
  ) {
    while (new Date(targetYear, targetMonth, currentDay).getMonth() !== targetMonth) {
      targetMonth += interval;
      if (targetMonth > 11) {
        targetYear++;
        targetMonth -= 12;
      }
    }

    remainingInterval--;
  }

  return new Date(targetYear, targetMonth, currentDay);
};

const getYearlyNextEventDate = (currentDate: Date, interval: number): Date => {
  if (currentDate.getMonth() === 1 && currentDate.getDate() === 29) {
    let newYear = currentDate.getFullYear() + interval * 4;
    if (!isLeapYear(newYear)) newYear += 4;

    currentDate.setFullYear(newYear);
  } else currentDate.setFullYear(currentDate.getFullYear() + interval);

  return currentDate;
};

export const getNextEventDate = (event: Event, currentDate: Date): Date | null => {
  const { type, interval } = event.repeat;

  switch (type) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      return currentDate;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * interval);
      return currentDate;
    case 'monthly':
      return getMonthlyNextEventDate(currentDate, interval);
    case 'yearly':
      return getYearlyNextEventDate(currentDate, interval);
    default: // type이 'none'이거나 잘못된 값인 경우
      return null;
  }
};

export const getRepeatEvents = (event: Event): Event[] => {
  const { repeat } = event;

  const newEvents = [];
  const endDate = new Date(repeat.endDate || '2050-12-31');

  let currentDate: Date | null = new Date(event.date);

  while (currentDate && currentDate <= endDate) {
    newEvents.push({ ...event, date: formatDate(currentDate) });

    const nextEventDate = getNextEventDate(event, currentDate);
    currentDate = nextEventDate;
  }

  return newEvents;
};
