import { Event } from '../types.ts';

// 특정 날짜가 지정된 날짜 형식과 일치하는지 확인하는 함수
const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
// 반복 일정 추가 함수

export const getEventsRepeats = (events: Event[], date: number): Event[] => {
    const targetDate = new Date(date);
  
    return events.filter((event) => {
      const eventStartDate = new Date(event.date);
      const { type, interval, endDate } = event.repeat;
  
      // 반복하지 않는 이벤트는 제외
      if (type === 'none') return isSameDay(eventStartDate, targetDate);
  
      // 반복 종료일이 지정된 경우 종료일 이후의 날짜는 제외
      if (endDate && new Date(endDate) < targetDate) return false;
  
      // 이벤트 시작일 이후의 날짜만 반복 포함
      if (eventStartDate > targetDate) return false;
  
      const daysDifference = Math.floor(
        (targetDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
  
      // 반복 유형별로 이벤트 포함 여부 결정
      switch (type) {
        case 'daily':
          return daysDifference % interval === 0;
        case 'weekly':
          return daysDifference % (7 * interval) === 0;
        case 'monthly':
          return (
            targetDate.getMonth() ===
              eventStartDate.getMonth() + interval * Math.floor(daysDifference / 30) &&
            targetDate.getDate() === eventStartDate.getDate()
          );
        case 'yearly':
          return (
            targetDate.getFullYear() ===
              eventStartDate.getFullYear() + interval * Math.floor(daysDifference / 365) &&
            isSameDay(eventStartDate, targetDate)
          );
        default:
          return false;
      }
    });
  };