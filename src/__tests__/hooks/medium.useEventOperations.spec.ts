import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerCreationWithNewRepeatedEvents,
  setupMockHandlerUpdatingWithNewRepeatedEvents,
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
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

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

it('🟢 반복 일정 정보가 담긴 이벤트를 저장하면 반복 일정 이벤트 목록까지 같이 추가되어 저장된다.', async () => {
  setupMockHandlerCreationWithNewRepeatedEvents();

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
    repeat: { type: 'daily', interval: 1, endDate: '2024-10-18' },
    notificationTime: 5,
  };

  const repeatedEvent: Event[] = [
    {
      ...newEvent,
      id: '2',
      date: '2024-10-17',
      repeat: {
        ...newEvent.repeat,
        id: newEvent.id,
      },
    },
    {
      ...newEvent,
      id: '3',
      date: '2024-10-18',
      repeat: {
        ...newEvent.repeat,
        id: newEvent.id,
      },
    },
  ];

  await act(async () => {
    await result.current.addEventWithNewRepeatedInfo(newEvent, repeatedEvent);
  });

  expect(result.current.events).toHaveLength(3);
  expect(result.current.events).toEqual([
    { ...newEvent, id: '1' },
    {
      ...newEvent,
      id: '2',
      date: '2024-10-17',
      repeat: {
        ...newEvent.repeat,
        id: newEvent.id,
      },
    },
    {
      ...newEvent,
      id: '3',
      date: '2024-10-18',
      repeat: {
        ...newEvent.repeat,
        id: newEvent.id,
      },
    },
  ]);
});

it('🟢 반복 일정이 없던 이벤트에 반복일정을 추가하고 저장하면 반복 일정 이벤트 목록까지 같이 추가되어 저장된다.', async () => {
  setupMockHandlerUpdatingWithNewRepeatedEvents();

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '2',
    date: '2024-10-15',
    startTime: '11:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 5,
    title: '수정된 회의',
    endTime: '12:00',
  };

  const repeatedEvent: Event[] = [
    {
      ...updatedEvent,
      id: '3',
      date: '2024-11-15',
      repeat: {
        ...updatedEvent.repeat,
        id: updatedEvent.id,
      },
    },
    {
      ...updatedEvent,
      id: '4',
      date: '2024-12-15',
      repeat: {
        ...updatedEvent.repeat,
        id: updatedEvent.id,
      },
    },
  ];

  await act(async () => {
    await result.current.updateEventWithNewRepeatedInfo(updatedEvent, repeatedEvent);
  });

  expect(result.current.events).toHaveLength(4);
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
    { ...updatedEvent, id: '2' },
    {
      ...updatedEvent,
      id: '3',
      date: '2024-11-15',
      repeat: {
        ...updatedEvent.repeat,
        id: updatedEvent.id,
      },
    },
    {
      ...updatedEvent,
      id: '4',
      date: '2024-12-15',
      repeat: {
        ...updatedEvent.repeat,
        id: updatedEvent.id,
      },
    },
  ]);
});
