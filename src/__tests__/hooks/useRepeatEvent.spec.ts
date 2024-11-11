import { renderHook, waitFor } from '@testing-library/react';

import { useEventOperations } from '../../hooks/useEventOperations';
import { useRepeatEvent } from '../../hooks/useRepeatEvent';
import { Event } from '../../types';

// 필수 요구사항
const useCombineHooks = (editing: boolean) => {
  const repeatEventHook = useRepeatEvent();
  const eventOperationHook = useEventOperations(editing, repeatEventHook.changeRepeatEvent);
  return { repeatEventHook, eventOperationHook };
};

it('일정의 초기값을 불러온 뒤 해당일정의 반복일정이 있다면 저장한다.', async () => {
  const { result } = renderHook(() => useCombineHooks(false));
  const mockEvent: Event = {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2024-11-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2024-12-24' },
    notificationTime: 1,
  };

  await waitFor(() => {
    const { eventId, type, interval, event } = result.current.repeatEventHook.repeatEvent[0];
    expect(eventId).toBe('2b7545a6-ebee-426c-b906-2329bc8d62bd');
    expect(type).toBe('monthly');
    expect(interval).toBe(1);
    expect(event.title).toBe('팀회의');
  });
});
it('일정을 생성할때 반복 일정을 설정하면 반복일정도 저장한다.', () => {});
it('일정에서 반복일정 전체를 수정할 때, 반복일정을 요청(유형, 간격, 종료일)에 맞게 수정한다.', () => {});
it('일정을 삭제할 때 해당 반복일정도 삭제한다.', () => {});
it('반복일정 중 하나를 수정하면 그 일정은 단일 일정으로 변경된다.', () => {});
it('반복일정 중 선택한 일정만 삭제한다.', () => {});
