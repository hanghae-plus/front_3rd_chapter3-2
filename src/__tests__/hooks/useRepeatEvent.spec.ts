import { act, renderHook } from '@testing-library/react';

import { useEventOperations } from '../../hooks/useEventOperations';
import { useRepeatEvent } from '../../hooks/useRepeatEvent';

// 필수 요구사항
const useCombineHooks = (editing: boolean) => {
  const repeatEventHook = useRepeatEvent();
  const eventOperationHook = useEventOperations(editing, repeatEventHook.changeRepeatEvent);
  return { repeatEventHook, eventOperationHook };
};

it('일정을 생성할때 반복일정이 있다면 저장한다.', async () => {
  const { result } = renderHook(() => useCombineHooks(false));

  await act(() => Promise.resolve(null));

  console.log(result.current.repeatEventHook.repeatEvent);
  const { eventId, type, interval, event } = result.current.repeatEventHook.repeatEvent[0];
  expect(eventId).toBe('2b7545a6-ebee-426c-b906-2329bc8d62bd');
  expect(type).toBe('monthly');
  expect(interval).toBe(1);
  expect(event[0].title).toBe('팀회의');
});
it('일정에서 반복일정 전체를 수정할 때, 반복일정을 요청(유형, 간격, 종료일)에 맞게 수정한다.', () => {});
it('일정을 삭제할 때 해당 반복일정도 삭제한다.', () => {});
it('반복일정 중 하나를 수정하면 그 일정은 단일 일정으로 변경된다.', () => {});
it('반복일정 중 선택한 일정만 삭제한다.', () => {});
