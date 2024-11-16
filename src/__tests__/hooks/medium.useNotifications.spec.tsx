import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import React from 'react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';

const events: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2024-11-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>;

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events), { wrapper });

  expect(result.current.notifications).toHaveLength(0);
});

let currentCallback = () => {};
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void) => {
    currentCallback = callback;
  },
}));

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2024-11-15T08:50:00'));

  const { result } = renderHook(() => useNotifications(events), { wrapper });

  act(() => {
    if (currentCallback) currentCallback();
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: createNotificationMessage(events[0]),
    },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date('2024-11-15T08:50:00'));

  const { result } = renderHook(() => useNotifications(events), { wrapper });

  act(() => {
    if (currentCallback) currentCallback();
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2024-11-15T08:50:00'));

  const { result } = renderHook(() => useNotifications(events), { wrapper });

  act(() => {
    if (currentCallback) currentCallback();
  });

  act(() => {
    if (currentCallback) currentCallback();
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
