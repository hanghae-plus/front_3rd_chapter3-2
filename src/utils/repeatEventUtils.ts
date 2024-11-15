import { RepeatInfo, RepeatType } from '../types';

const WEEKLY = 7;
const MAX_OCCURRENCES = 3653;
const DEFAULT_END_DATE = '2025-06-30';

const formatDateToString = (date: Date) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate.toISOString().split('T')[0];
};

const formatStringToDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getLastDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const addMonthsAndAdjustDate = (date: Date, interval: number) => {
  const originalDay = date.getDate();
  const totalMonths = date.getMonth() + interval;
  const yearOffset = Math.floor(totalMonths / 12);
  const newMonth = totalMonths % 12;

  // 음수 월 처리
  const normalizedMonth = newMonth < 0 ? newMonth + 12 : newMonth;
  const adjustedYearOffset = newMonth < 0 ? yearOffset - 1 : yearOffset;

  const newDate = new Date(date);
  newDate.setFullYear(date.getFullYear() + adjustedYearOffset);
  newDate.setMonth(normalizedMonth);

  const lastDayOfNewMonth = getLastDayOfMonth(newDate);
  newDate.setDate(Math.min(originalDay, lastDayOfNewMonth));

  return newDate;
};

const addYearsAndAdjustDate = (date: Date, interval: number) => {
  const originalMonth = date.getMonth();
  const originalDay = date.getDate();
  const newYear = date.getFullYear() + interval;

  // 2월 처리
  if (originalMonth === 1) {
    const lastDayOfFebruary = isLeapYear(newYear) ? 29 : 28;

    if (originalDay >= 28) {
      return new Date(newYear, 1, lastDayOfFebruary);
    }
  }

  return new Date(newYear, originalMonth, originalDay);
};

const addRepeatDate = (date: Date, repeatType: RepeatType, interval: number) => {
  const newDate = new Date(date);

  switch (repeatType) {
    case 'daily':
      newDate.setDate(date.getDate() + interval);
      return newDate;
    case 'weekly':
      newDate.setDate(date.getDate() + interval * WEEKLY);
      return newDate;
    case 'monthly':
      return addMonthsAndAdjustDate(date, interval);
    case 'yearly':
      return addYearsAndAdjustDate(date, interval);
    default:
      return date;
  }
};

export const generateRepeatEventDates = (baseDate: string, repeat: RepeatInfo) => {
  if (!repeat.type || repeat.type === 'none') {
    return [baseDate];
  }

  const stringDateList: string[] = [];
  const startDate = formatStringToDate(baseDate);
  const endDate = repeat.endDate
    ? formatStringToDate(repeat.endDate)
    : formatStringToDate(DEFAULT_END_DATE);

  let currentDate = startDate;
  let occurrenceCount = 0;

  while (currentDate <= endDate && occurrenceCount < MAX_OCCURRENCES) {
    // 날짜 비교를 위해 시간 정보 초기화
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    const compareEndDate = new Date(endDate);
    compareEndDate.setHours(0, 0, 0, 0);

    if (compareDate > compareEndDate) {
      break;
    }

    stringDateList.push(formatDateToString(currentDate));
    currentDate = addRepeatDate(currentDate, repeat.type, repeat.interval);
    occurrenceCount++;
  }

  return stringDateList;
};
