import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../features/event/model/useNotifications.ts';
import { Event } from '../../types.ts';

import { createNotificationMessage } from '@/features/event/lib/notificationUtils.ts';

const events: Event[] = [
  {
    id: '1',
    title: 'test',
    date: '2024-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: 'test',
    location: 'test',
    category: 'test',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-15T09:50:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(events));
    expect(result.current.notifications).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: createNotificationMessage(events[0]) },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: createNotificationMessage(events[0]) },
    ]);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const notification = [{ id: '1', message: createNotificationMessage(events[0]) }];

    expect(result.current.notifications).toEqual(notification);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 1초 뒤에 추가적인 알림이 발생하지 않아야 한다.
    expect(result.current.notifications).toEqual(notification);
  });
});
