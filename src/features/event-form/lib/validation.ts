import { FormErrors } from '../model/types';

export const validateTime = (startTime: string, endTime: string): FormErrors => {
  if (!startTime || !endTime) {
    return { startTime: null, endTime: null };
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    const error = '종료 시간은 시작 시간보다 커야 합니다.';
    return { startTime: error, endTime: error };
  }

  return { startTime: null, endTime: null };
};
