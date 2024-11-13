import { act, renderHook } from '@testing-library/react';

import { Event } from '../../entities/event/model/types.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { formatDate } from '../../shared/lib/date.ts';

const 초 = 1000;
const 분 = 초 * 60;

let currentCallback = () => {};
vi.mock('@chakra-ui/react', () => ({
  useInterval: (callback: () => void) => {
    currentCallback = callback;
  },
}));

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2024-01-01T10:00:00'));
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-01-01',
      startTime: '10:10',
      endTime: '10:20',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '', endCondition: 'never' },
      notificationTime: {
        value: 5,
        label: '5분 전',
      },
      isRepeating: false,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toHaveLength(0);

  // 알림 시간으로 이동 (5분 후)
  act(() => {
    vi.setSystemTime(new Date('2024-01-01T10:05:00'));
    currentCallback();
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toEqual(['1']);
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
  vi.setSystemTime(new Date('2024-01-01T10:00:00'));
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-01-01',
      startTime: '10:10', // 10분 후 시작
      endTime: '10:20',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '', endCondition: 'never' },
      notificationTime: {
        value: 5,
        label: '5분 전',
      },
      isRepeating: false,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  // 첫 번째 알림 시점
  act(() => {
    vi.setSystemTime(new Date('2024-01-01T10:05:00'));
    currentCallback();
  });

  expect(result.current.notifications).toHaveLength(1);

  // 추가 시간 진행
  act(() => {
    vi.setSystemTime(new Date('2024-01-01T10:10:00'));
    currentCallback();
  });

  // 알림 개수는 여전히 1개여야 함
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
