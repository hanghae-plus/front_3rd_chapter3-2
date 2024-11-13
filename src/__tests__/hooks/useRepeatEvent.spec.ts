import { act, renderHook } from '@testing-library/react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useRepeatEvent } from '../../hooks/useRepeatEvent';
import { Event } from '../../types';

const useCombineHooks = (editing: boolean) => {
  const repeatEventHook = useRepeatEvent();
  const eventOperationHook = useEventOperations(editing, repeatEventHook.updateRepeatEvent);
  return { repeatEventHook, eventOperationHook };
};

it('새로운 일정을 추가할 때 반복일정을 저장한다.', async () => {
  setupMockHandlerCreation();
  const { result } = renderHook(() => useCombineHooks(false));

  const event: Event = {
    id: '3b9487dd-b5e9-4ebe-8a9d-e85c46b89e0d',
    title: '카이 하베르츠',
    date: '2024-11-13',
    startTime: '04:25',
    endTime: '16:25',
    description: 'ㅁㄴㅇ2',
    location: 'ㅇㅂㅈㅇ',
    category: '개인',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-10' },
    notificationTime: 10,
  };

  await act(() => result.current.eventOperationHook.saveEvent(event));

  expect(result.current.repeatEventHook.repeatEvent).toHaveLength(10);
});

// 요구사항 6
it('반복일정 개별삭제한다.', async () => {});
