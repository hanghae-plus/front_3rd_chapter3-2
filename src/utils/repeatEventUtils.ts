import { RepeatInfo } from '../types';

const formatDateToString = (date: Date) => date.toISOString().split('T')[0];
const formatStringToDate = (dateString: string) => new Date(dateString);

const addWeeks = (date: Date, weeks: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + weeks * 7);
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

    switch (repeat.type) {
      case 'daily':
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, repeat.interval);
        break;
      case 'monthly':
        break;
      case 'yearly':
        break;
    }
  }

  return stringDateList;
};
