export const getTimeErrorMessage = (startTime: string, endTime: string): string | null => {
  if (!startTime || !endTime) return null;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    return '종료 시간은 시작 시간보다 커야 합니다.';
  }

  return null;
};
