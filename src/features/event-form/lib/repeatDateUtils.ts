/* eslint-disable no-case-declarations */
import { RepeatType } from '../../../entities/event/model/types';

const getLastDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const isLastDayOfMonth = (date: Date): boolean => {
  return date.getDate() === getLastDayOfMonth(date);
};

export const findRepeatDate = (
  startDate: string,
  endDate: string,
  interval: string,
  repeatType: RepeatType
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const repeatDate: string[] = [];
  const intervalNum = parseInt(interval);

  // 시작일이 월말인지 체크
  const isStartDateLastDay = isLastDayOfMonth(start);

  // 첫 날짜 설정
  let currentDate = new Date(start);
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();
  let currentDay = currentDate.getDate();

  while (currentDate <= end) {
    switch (repeatType) {
      case 'daily':
        repeatDate.push(currentDate.toISOString());
        currentDate.setDate(currentDate.getDate() + intervalNum);
        break;

      case 'weekly':
        repeatDate.push(currentDate.toISOString());
        currentDate.setDate(currentDate.getDate() + intervalNum * 7);
        break;

      case 'monthly': {
        // 현재 날짜 추가
        repeatDate.push(currentDate.toISOString());

        // 다음 달 계산
        currentMonth += intervalNum;
        if (currentMonth >= 12) {
          currentYear += Math.floor(currentMonth / 12);
          currentMonth = currentMonth % 12;
        }

        if (isStartDateLastDay) {
          // 다음 달의 마지막 날 계산
          const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
          currentDate = new Date(currentYear, currentMonth, lastDay);
        } else {
          // 원래 날짜 유지 (자동으로 월말 조정됨)
          currentDate = new Date(currentYear, currentMonth, currentDay);
        }
        break;
      }

      case 'yearly':
        repeatDate.push(currentDate.toISOString());
        currentYear += intervalNum;
        currentDate = new Date(currentYear, currentMonth, currentDay);
        break;

      default:
        break;
    }
  }

  return repeatDate;
};
