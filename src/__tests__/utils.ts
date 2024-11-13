import { renderHook, waitFor } from '@testing-library/react';
import { fillZero } from '../utils/dateUtils';
import { useEventOperations } from '../hooks/useEventOperations';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const setupEvents = async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toBeDefined();
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  return result.current.events;
};
