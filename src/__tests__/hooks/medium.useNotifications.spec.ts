import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const 초 = 1000;
const 분 = 초 * 60;

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const notificationTime = 5;
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(Date.now() + 10 * 분),
      endTime: parseHM(Date.now() + 20 * 분),
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toHaveLength(0);

  vi.setSystemTime(new Date(Date.now() + notificationTime * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '테스트 알림 1' },
      { id: '2', message: '테스트 알림 2' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('테스트 알림 2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(Date.now() + 10 * 분),
      endTime: parseHM(Date.now() + 20 * 분),
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  vi.setSystemTime(new Date(Date.now() + 5 * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  vi.setSystemTime(new Date(Date.now() + 20 * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});
