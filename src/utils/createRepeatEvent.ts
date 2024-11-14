import { EventForm, RepeatType } from '../types';
import { formatDate, isLeapYear } from './dateUtils';

interface DateGeneratorParams {
  date: Date;
  interval: number;
}

// eslint-disable-next-line no-unused-vars
type DateGenerator = (params: DateGeneratorParams) => Date | null;

const DEFAULT_MAX_DATE = new Date('2025-06-30');

const addDays = ({ date, interval }: DateGeneratorParams) => {
  const newDate = new Date(date);

  newDate.setDate(date.getDate() + interval);
  return newDate;
};

const addMonths = ({ date, interval }: DateGeneratorParams) => {
  const newDate = new Date(date);
  const baseDay = date.getDate();

  newDate.setMonth(newDate.getMonth() + interval);
  newDate.setDate(baseDay);

  if (newDate.getDate() !== baseDay) {
    return null;
  }

  return newDate;
};

const addYears = ({ date, interval }: DateGeneratorParams) => {
  const newDate = new Date(date);

  const baseDay = date.getDate();
  const baseMonth = date.getMonth();
  const baseYear = date.getFullYear();

  const findNextLeapYear = (year: number, step: number): number => {
    const nextYear = year + step;
    return isLeapYear(nextYear) ? nextYear : findNextLeapYear(nextYear, step);
  };

  const calculateTargetYear = (year: number) =>
    baseMonth === 1 && baseDay === 29 ? findNextLeapYear(year, interval) : year + interval;

  const targetYear = calculateTargetYear(baseYear);
  newDate.setFullYear(targetYear);
  newDate.setMonth(baseMonth);
  newDate.setDate(baseDay);

  const isValidDate = (date: Date) => date.getMonth() === baseMonth && date.getDate() === baseDay;

  const adjustInvalidDate = (date: Date): Date => {
    if (isValidDate(date)) {
      return date;
    }

    const adjustedDate = new Date(date);
    adjustedDate.setMonth(0);
    adjustedDate.setDate(1);
    adjustedDate.setFullYear(date.getFullYear() + 1);
    return adjustedDate;
  };

  return adjustInvalidDate(newDate);
};

const getDateGenerator = (type: RepeatType): DateGenerator => {
  const generators: Record<string, DateGenerator> = {
    daily: addDays,
    weekly: (params) => addDays({ ...params, interval: params.interval * 7 }),
    monthly: addMonths,
    yearly: addYears,
    none: ({ date }) => new Date(date),
  };

  return generators[type] || generators.none;
};

const generateNextDate = (
  currentDate: Date,
  endDate: Date,
  dateGenerator: DateGenerator,
  interval: number
) => {
  const nextDate = dateGenerator({ date: currentDate, interval });

  if (!nextDate || nextDate > endDate || nextDate <= currentDate) {
    return null;
  }
  return nextDate;
};

const generateDateSequence = (
  startDate: Date,
  endDate: Date,
  dateGenerator: DateGenerator,
  interval: number
) => {
  const generateSequence = (acc: Date[]): Date[] => {
    const currentDate = acc[acc.length - 1];
    const nextDate = generateNextDate(currentDate, endDate, dateGenerator, interval);

    return nextDate ? generateSequence([...acc, nextDate]) : acc;
  };

  return generateSequence([startDate]);
};

export const createRepeatEvents = (eventData: EventForm) => {
  const { type: repeatType, interval: repeatInterval, endDate: repeatEndDate } = eventData.repeat;

  if (repeatType === 'none' || repeatInterval === 0) {
    return [eventData];
  }

  const startDate = new Date(eventData.date);
  const endDate = repeatEndDate ? new Date(repeatEndDate) : DEFAULT_MAX_DATE;

  const dateGenerator = getDateGenerator(repeatType);

  return generateDateSequence(startDate, endDate, dateGenerator, repeatInterval).map(
    (generatedDate) => ({
      ...eventData,
      date: formatDate(generatedDate),
    })
  );
};
