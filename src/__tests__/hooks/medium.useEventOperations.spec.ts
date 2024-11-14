import { useToast } from '@chakra-ui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Mock } from 'vitest';

import {
  createEventResolver,
  updateEventResolver,
  deleteEventResolver,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../features/event/model/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const initialEvents = events as Event[];

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => {
  const originalModule = vi.importActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: vi.fn(),
  };
});
(useToast as Mock).mockReturnValue(mockToast);

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    // 초기 이벤트 데이터 확인
    expect(result.current.events).toEqual(initialEvents);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: EventForm = {
    title: '새로운 이벤트',
    date: '2024-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 이벤트 설명',
    location: '새로운 장소',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { list: resultEvents } = createEventResolver(initialEvents, newEvent);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(initialEvents);
  });

  act(() => {
    result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(resultEvents);
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const updatedEvent: Event = {
    ...initialEvents[0],
    title: '업데이트된 이벤트',
    endTime: '12:00',
  };

  const { list: resultEvents } = updateEventResolver(initialEvents, updatedEvent);
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(initialEvents);
  });

  act(() => {
    result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(resultEvents);
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { list: resultEvents } = deleteEventResolver(initialEvents, initialEvents[0].id);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual(initialEvents);
  });

  act(() => {
    result.current.deleteEvent(initialEvents[0].id);
  });

  await waitFor(() => {
    expect(result.current.events).toEqual(resultEvents);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ message: '이벤트 로딩 실패' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([]);
    expect(mockToast).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await result.current.saveEvent(initialEvents[0]);

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await result.current.deleteEvent(initialEvents[0].id);

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
