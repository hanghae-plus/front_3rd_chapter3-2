import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerEventsListCreation,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
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
  ]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2024-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2024-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    title: '이벤트 로딩 실패',
    status: 'error',
  });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2024-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    title: '일정 저장 실패',
    status: 'error',
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    title: '일정 삭제 실패',
    status: 'error',
  });

  expect(result.current.events).toHaveLength(1);
});

it('반복 일정이 생성되어 올바르게 저장된다', async () => {
  setupMockHandlerEventsListCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '기존 일정',
    date: '2024-11-04',
    startTime: '13:00',
    endTime: '14:00',
    description: 'CoreTech Weekly Standup',
    location: 'CoreTech 회의실',
    category: '업무',
    repeat: { type: 'monthly', interval: 3, endDate: '2025-03-31' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveRepeatEvents(newEvent);
  });

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 일정',
      date: '2024-11-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 3, endDate: '2025-03-31' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 일정',
      date: '2025-02-04',
      startTime: '13:00',
      endTime: '14:00',
      description: 'CoreTech Weekly Standup',
      location: 'CoreTech 회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 3, endDate: '2025-03-31' },
      notificationTime: 10,
    },
  ]);
});

it('매주 반복되는 일정이 올바르게 생성된다', async () => {
  setupMockHandlerEventsListCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const weeklyEvent: Event = {
    id: '1',
    title: '해리와 과제하기',
    date: '2024-11-11',
    startTime: '18:00',
    endTime: '22:00',
    description: '항해 플러스 8주차 과제하기',
    location: '스파크플러스',
    category: '개인',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-11-25' },
    notificationTime: 0,
  };

  await act(async () => {
    await result.current.saveRepeatEvents(weeklyEvent);
  });

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '해리와 과제하기',
      date: '2024-11-11',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-11-25' },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '해리와 과제하기',
      date: '2024-11-18',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-11-25' },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '해리와 과제하기',
      date: '2024-11-25',
      startTime: '18:00',
      endTime: '22:00',
      description: '항해 플러스 8주차 과제하기',
      location: '스파크플러스',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-11-25' },
      notificationTime: 0,
    },
  ]);
});

it("이벤트 목록을 생성할 때 네트워크 오류가 발생하면 '일정 저장 실패'라는 메시지가 표시된다.", async () => {
  server.use(
    http.post('/api/events-list', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  const event: Event = {
    id: '1',
    title: '해리와 코드 리뷰',
    date: '2024-11-14',
    startTime: '14:00',
    endTime: '15:00',
    description: '해리와 주간 코드 리뷰',
    location: '스파크플러스',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2024-11-20' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveRepeatEvents(event);
  });

  expect(toastFn).toHaveBeenCalledWith({
    duration: 3000,
    isClosable: true,
    title: '일정 저장 실패',
    status: 'error',
  });
});

it('네트워크 오류가 발생해도 이벤트가 삭제되지 않아야 한다.', async () => {
  server.use(
    http.post('/api/events-list', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  const event: Event = {
    id: '1',
    title: '해리랑 점심 먹기',
    date: '2024-11-12',
    startTime: '12:30',
    endTime: '13:30',
    description: '해리랑 처음으로 점심먹기',
    location: '식당',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-01' },
    notificationTime: 5,
  };

  await act(async () => {
    await result.current.saveRepeatEvents(event);
  });

  expect(result.current.events).toHaveLength(1);
});
