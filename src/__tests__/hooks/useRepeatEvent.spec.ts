import { act, renderHook } from '@testing-library/react';

import { setupMockHandlerDeletion, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useRepeatEvent } from '../../hooks/useRepeatEvent';
import { Event } from '../../types';

const useCombineHooks = (editing: boolean) => {
  const repeatEventHook = useRepeatEvent();
  const eventOperationHook = useEventOperations(editing, repeatEventHook.changeRepeatEvent);
  return { repeatEventHook, eventOperationHook };
};

// 필수 요구사항
it('일정을 생성할때 반복일정이 있다면 저장한다.', async () => {
  const { result } = renderHook(() => useCombineHooks(false));

  await act(() => Promise.resolve(null));

  const { eventId, type, interval, event } = result.current.repeatEventHook.repeatEvent[0];
  expect(eventId).toBe('2ab06561-10f8-4e7f-8128-4b2dd343c6b9');
  expect(type).toBe('monthly');
  expect(interval).toBe(1);
  expect(event[0].title).toBe('기존 회의');
});

it('일정에서 반복일정 전체를 수정할 때, 반복일정을 요청(유형, 간격, 종료일)에 맞게 수정한다.', async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useCombineHooks(true));

  await act(() => Promise.resolve());

  const updatedEvent: Event = {
    id: '2ab06561-10f8-4e7f-8128-4b2dd343c6b9',
    title: '기존 회의',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'daily', interval: 2, endDate: '2024-11-20' },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.eventOperationHook.saveEvent(updatedEvent);
  });

  const { eventId, type, interval, event } = result.current.repeatEventHook.repeatEvent[0];
  expect(event).toHaveLength(19);
  expect(eventId).toBe('2ab06561-10f8-4e7f-8128-4b2dd343c6b9');
  expect(type).toBe('daily');
  expect(interval).toBe(2);
  expect(event[0].date).toBe('2024-10-15');
  expect(event[18].date).toBe('2024-11-20');
});

it('일정을 삭제할 때 해당 반복일정도 삭제한다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useCombineHooks(false));

  await act(() => Promise.resolve(null));

  expect(result.current.eventOperationHook.events).toHaveLength(1);
  expect(result.current.repeatEventHook.repeatEvent).toHaveLength(1);

  expect(result.current.eventOperationHook.events[0].id).toBe(
    '2ab06561-10f8-4e7f-8128-4b2dd343c6b9'
  );

  await act(async () => {
    result.current.eventOperationHook.deleteEvent('2ab06561-10f8-4e7f-8128-4b2dd343c6b9');
  });

  expect(result.current.eventOperationHook.events).toHaveLength(0);
  expect(result.current.repeatEventHook.repeatEvent).toHaveLength(0);
});

it('반복일정 중 하나를 수정하면 그 일정은 단일 일정으로 변경된다.', () => {});
it('반복일정 중 선택한 일정만 삭제한다.', () => {});
