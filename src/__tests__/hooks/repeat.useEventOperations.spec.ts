import { act, renderHook } from '@testing-library/react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('정의된 반복 이벤트 정보를 기준으로 적절하게 저장이 된다', () => {
  it('daily 타입 반복 정보를 기준으로 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-10-17' },
      { ...newEvent, id: '3', date: '2024-10-18' },
    ]);
  });
  it('daily 타입 반복 정보를 기준으로 간격이 2일때 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-10-18' },
      { ...newEvent, id: '3', date: '2024-10-20' },
    ]);
  });
  it('weekly 타입 반복 정보를 기준으로 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'weekly', interval: 1, endDate: '2024-10-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-10-23' },
      { ...newEvent, id: '3', date: '2024-10-30' },
    ]);
  });
  it('weekly 타입 반복 정보를 기준으로 간격이 3일때 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'weekly', interval: 3, endDate: '2024-11-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-11-06' },
      { ...newEvent, id: '3', date: '2024-11-27' },
    ]);
  });
  it('monthly 타입 반복 정보를 기준으로 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'monthly', interval: 1, endDate: '2025-01-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-11-16' },
      { ...newEvent, id: '3', date: '2024-12-16' },
      { ...newEvent, id: '4', date: '2025-01-16' },
    ]);
  });
  it('monthly 타입 반복 정보를 기준으로 간격이 4일때 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'monthly', interval: 4, endDate: '2025-06-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2025-02-16' },
      { ...newEvent, id: '3', date: '2025-06-16' },
    ]);
  });
  it('yearly 타입 반복 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();
    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const newEvent: Event = {
      id: '1',
      title: '새 회의',
      date: '2024-02-16',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'yearly', interval: 1, endDate: '2025-03-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2025-02-16' },
    ]);
  });
  it('yearly 타입 반복 정보를 기준으로 간격이 2일때 적절하게 저장이 된다', async () => {
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
      repeat: { type: 'yearly', interval: 2, endDate: '2027-06-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2026-10-16' },
    ]);
  });
});

describe('정의된 반복 이벤트 정보가 윤년일때, 적절하게 저장이 된다', () => {
  it('yearly 타입 반복 정보가 윤년일때 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const newEvent: Event = {
      id: '1',
      title: '새 회의',
      date: '2024-02-29',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'yearly', interval: 2, endDate: '2027-01-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2026-02-28' },
    ]);
  });
  it('monthly 타입 반복 정보가 윤년일때 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const newEvent: Event = {
      id: '1',
      title: '새 회의',
      date: '2024-02-29',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'monthly', interval: 2, endDate: '2025-02-30' },
      notificationTime: 5,
    };

    await act(async () => {
      await result.current.saveRepeatEvent(newEvent);
    });

    expect(result.current.events).toEqual([
      { ...newEvent, id: '1' },
      { ...newEvent, id: '2', date: '2024-04-29' },
      { ...newEvent, id: '3', date: '2024-06-29' },
      { ...newEvent, id: '4', date: '2024-08-29' },
      { ...newEvent, id: '5', date: '2024-10-29' },
      { ...newEvent, id: '6', date: '2024-12-29' },
      { ...newEvent, id: '7', date: '2025-02-28' }, //2025-03-01를 출력하고있네? 예외처리 해야겠다!
    ]);
  });
});
