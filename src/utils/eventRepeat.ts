import { Event } from '../types';
import { isLeapYear } from './dateUtils';
import { Toast } from '@chakra-ui/react';

export const generateRepeatEvents = (event: Event): Event[] => {
  const startDate = new Date(event.date);

  if (!event.repeat.endDate) {
    Toast({
      title: '반복 일정에는 종료 날짜가 필요합니다.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
    return []; // 또는 종료 날짜가 없는 경우 일정을 생성하지 않도록 빈 배열 반환
  }

  const endDate = new Date(event.repeat.endDate);

  const repeatEvents: Event[] = [];
  let currentDate = new Date(startDate);
  const originalDay = startDate.getDate(); // 최초 일자를 고정

  while (currentDate <= endDate) {
    repeatEvents.push({ ...event, date: currentDate.toISOString().split('T')[0] });
    currentDate = getNextRepeatDate(
      currentDate,
      event.repeat.type,
      event.repeat.interval,
      originalDay
    );
  }

  return repeatEvents;
};

export const getNextRepeatDate = (
  date: Date,
  type: string,
  interval: number,
  originalDay: number
): Date => {
  const nextDate = new Date(date);

  switch (type) {
    case 'daily':
      nextDate.setDate(date.getDate() + interval);
      break;

    case 'weekly':
      nextDate.setDate(date.getDate() + interval * 7);
      break;

    case 'monthly':
      nextDate.setDate(1);
      nextDate.setMonth(date.getMonth() + interval);
      const lastDayOfNextMonth = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth() + 1,
        0
      ).getDate();
      nextDate.setDate(Math.min(originalDay, lastDayOfNextMonth));
      break;

    case 'yearly':
      const nextYear = date.getFullYear() + interval;
      nextDate.setFullYear(nextYear, date.getMonth(), 1);
      if (date.getMonth() === 1 && originalDay === 29) {
        nextDate.setDate(isLeapYear(nextYear) ? 29 : 28);
      } else {
        nextDate.setDate(originalDay);
      }
      break;
  }

  return nextDate;
};
