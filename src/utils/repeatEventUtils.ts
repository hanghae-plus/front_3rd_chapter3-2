import { RepeatInfo, RepeatType } from '../types';

const WEEKLY = 7;

const formatDateToString = (date: Date) => date.toISOString().split('T')[0];
const formatStringToDate = (dateString: string) => new Date(dateString);

const addRepeatDate = (date: Date, repeatType: RepeatType, interval: number) => {
  const newDate = new Date(date);

  switch (repeatType) {
    case 'daily':
      newDate.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      newDate.setDate(date.getDate() + interval * WEEKLY);
      break;
    case 'monthly':
      newDate.setMonth(date.getMonth() + interval);
      break;
    case 'yearly':
      newDate.setFullYear(date.getFullYear() + interval);
      break;
  }
  return newDate;
};

export const generateRepeatEventDates = (baseDate: string, repeat: RepeatInfo) => {
  if (!repeat.type || repeat.type === 'none') {
    return [baseDate];
  }

  const stringDateList: string[] = [];

  const startDate = formatStringToDate(baseDate);
  const endDate = repeat.endDate
    ? formatStringToDate(repeat.endDate)
    : formatStringToDate('2025-06-30');

  let currentDate = startDate;

  while (currentDate <= endDate) {
    stringDateList.push(formatDateToString(currentDate));
    currentDate = addRepeatDate(currentDate, repeat.type, repeat.interval);
  }

  return stringDateList;
};
