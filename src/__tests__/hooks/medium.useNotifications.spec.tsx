import { ChakraProvider, useToast, UseToastOptions } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { createEvent } from '../../__mocks__/Factory.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createQueryClient } from '@/createQueryClient.ts';

let toastCalls: any[] = [];

// toast mock
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn().mockImplementation(() => (options: UseToastOptions) => {
      toastCalls.push(options);
    }),
  };
});

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>{children}</ChakraProvider>
      </QueryClientProvider>
    );
  };

describe('-', () => {
  let notificationResult: { current: ReturnType<typeof useNotifications> };
  const toast = useToast();
  const queryClient = createQueryClient(toast);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    const wrapper = createWrapper(queryClient);

    notificationResult = renderHook(() => useNotifications(), { wrapper }).result;
  });

  afterEach(() => notificationResult.current.reset());

  it('초기 상태에서는 알림이 없어야 한다', async () => {
    // THEN: 초기 상태에 알림이 없어야 한다.
    expect(notificationResult.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    // GIVEN: 알림을 발생시키기 위한 이벤트 데이터 설정
    const MOCK_EVENT = createEvent({
      id: 'unique-event-id',
      title: '중복 방지 테스트 이벤트',
      date: '2024-10-01',
      startTime: '01:00',
      endTime: '02:00',
      notificationTime: 10,
    }) as Event;

    act(() => {
      notificationResult.current.updateNotifications([MOCK_EVENT]);
    });

    // WHEN: 알림 충족하는 시간이 되었을 때
    vi.advanceTimersByTime(1000 * 60 * 50);

    // THEN: 알림이 하나 추가 되어있어야 한다.
    await waitFor(() =>
      expect(notificationResult.current.notifications).toEqual([
        {
          id: MOCK_EVENT.id,
          message: `${MOCK_EVENT.notificationTime}분 후 ${MOCK_EVENT.title} 일정이 시작됩니다.`,
        },
      ])
    );
    await waitFor(() => expect(notificationResult.current.notifications).toHaveLength(1));
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    // GIVEN: 알림을 발생시키기 위한 이벤트 데이터 설정
    const MOCK_EVENT_1 = createEvent({
      id: '4',
      title: 'test1',
      date: '2024-10-01',
      startTime: '01:00',
      endTime: '02:00',
      notificationTime: 10,
    }) as Event;

    const MOCK_EVENT_2 = createEvent({
      id: '5',
      title: 'test2',
      date: '2024-10-01',
      startTime: '02:00',
      endTime: '03:00',
      notificationTime: 10,
    }) as Event;
    act(() => {
      notificationResult.current.updateNotifications([MOCK_EVENT_1, MOCK_EVENT_2]);
    });

    // WHEN: 두 알림이 충족하는 시간이 지났을 때
    vi.advanceTimersByTime(1000 * 60 * 60 * 2);

    // THEN: 두 개의 알림이 세팅되어 있어야 한다.
    await waitFor(() => expect(notificationResult.current.notifications).toHaveLength(2));

    // WHEN: 첫번째 알림을 지웠을 때
    notificationResult.current.deleteNotification(0);

    // THEN: 첫번째 알림 정보가 없어야 한다.
    await waitFor(() => expect(notificationResult.current.notifications).toHaveLength(1));
    expect(notificationResult.current.notifications).not.toStrictEqual({
      id: MOCK_EVENT_1.id,
      message: `${MOCK_EVENT_1.notificationTime}분 후 ${MOCK_EVENT_1.title} 일정이 시작됩니다.`,
    });

    // THEN: 두번째 알림 정보만 존재해야 한다.
    expect(notificationResult.current.notifications).toEqual([
      {
        id: MOCK_EVENT_2.id,
        message: `${MOCK_EVENT_2.notificationTime}분 후 ${MOCK_EVENT_2.title} 일정이 시작됩니다.`,
      },
    ]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    // GIVEN: 알림을 발생시키기 위한 이벤트 데이터 설정
    const mockData1 = createEvent({
      id: 'unique-event-id',
      title: '중복 방지 테스트 이벤트',
      date: '2024-10-01',
      startTime: '01:00',
      endTime: '02:00',
      notificationTime: 10, // 10분 전 알림
    }) as Event;

    // WHEN: 알림 조건을 충족하는 이벤트를 추가했을 때
    act(() => {
      notificationResult.current.updateNotifications([mockData1]);
    });

    // THEN: 알림이 한 개 추가되어있어야 한다.
    await waitFor(() => {
      expect(notificationResult.current.notifications).toEqual([
        {
          id: mockData1.id,
          message: `${mockData1.notificationTime}분 후 ${mockData1.title} 일정이 시작됩니다.`,
        },
      ]);
    });

    // THEN: 알림이 발생한 이벤트 ID를 추적하는 상태가 업데이트되어 있어야 한다.
    expect(notificationResult.current.notifiedEvents.has(mockData1.id)).toBe(true);

    // WHEN: 동일한 이벤트가 다시 알림 조건을 충족했을 때
    act(() => {
      notificationResult.current.updateNotifications([mockData1]);
    });

    // THEN: notifications 배열에 중복된 알림이 추가되지 않아야 한다.
    await waitFor(() => {
      expect(notificationResult.current.notifications).toHaveLength(1);
      expect(notificationResult.current.notifications).toEqual([
        {
          id: mockData1.id,
          message: `${mockData1.notificationTime}분 후 ${mockData1.title} 일정이 시작됩니다.`,
        },
      ]);
    });
  });
});
