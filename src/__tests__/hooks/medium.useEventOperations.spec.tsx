import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'jotai';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { setupMockHandler } from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>;

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandler(events as Event[]);
  const { result } = renderHook(() => useEventOperations(false, () => {}), { wrapper });

  await waitFor(() => {
    expect(result.current.events).toEqual([
      {
        id: '1',
        title: '기존 회의',
        date: '2024-11-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  // useEventOperations 첫번째 파라미터 editing: false
  const initEvents = [
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
    {
      id: '2',
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
  setupMockHandler(initEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(false, () => {}), { wrapper });

  const newEvent = {
    title: '커피 한 잔 마시기 new',
    startTime: '11:00',
    endTime: '12:00',
    description: '커피 한 잔 마시기',
    location: '카페',
    category: '기타',
    date: '2024-11-20',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  };

  await act(() => {
    result.current.saveEvent(newEvent as Event);
  });

  expect(result.current.events).toHaveLength(3);
  expect(result.current.events[2]).toEqual({
    id: '3',
    title: '커피 한 잔 마시기 new',
    startTime: '11:00',
    endTime: '12:00',
    description: '커피 한 잔 마시기',
    location: '카페',
    category: '기타',
    date: '2024-11-20',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const initEvents = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandler(initEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(true, () => {}), { wrapper });

  const updatedEvent = {
    id: '1',
    title: '기존 회의 updated',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(() => {
    result.current.saveEvent(updatedEvent as Event);
  });

  expect(result.current.events).toEqual([updatedEvent]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const initEvents = [
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
  setupMockHandler(initEvents as Event[]);

  const { result } = renderHook(() => useEventOperations(false, () => {}), { wrapper });

  await act(() => {
    result.current.deleteEvent('1');
  });

  expect(result.current.events).toHaveLength(0);
});

const toastMock = vi.fn();
vi.mock('@chakra-ui/react', () => {
  const actual = vi.importActual('@chakra-ui/react');

  return {
    ...actual,
    useToast: () => toastMock,
  };
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false, () => {}), { wrapper });

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(0);
  expect(toastMock).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(true, () => {}), { wrapper });

  const updatedEvent = {
    id: '2',
    title: '기존 회의 updated',
    date: '2024-11-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(() => {
    result.current.saveEvent(updatedEvent as Event);
  });

  expect(toastMock).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false, () => {}), { wrapper });

  await act(() => {
    result.current.deleteEvent('1');
  });

  expect(toastMock).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
