import { validateEvent } from '../../features/event/lib/eventValidate';

import { EventForm } from '@/types';

describe('validateEvent', () => {
  it('필수 정보가 모두 입력되어 있으면 true를 반환한다', () => {
    const event = {
      title: '회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    } as EventForm;
    const result = validateEvent({
      event,
      error: { startTimeError: null, endTimeError: null },
    });
    expect(result.required).toBe(true);
    expect(result.time).toBe(true);
  });

  it('필수 정보가 모두 입력되어 있지 않으면 false를 반환한다', () => {
    const invalidEvent = {
      title: '',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    } as EventForm;

    const result = validateEvent({
      event: invalidEvent,
      error: { startTimeError: null, endTimeError: null },
    });
    expect(result.required).toBe(false);
    expect(result.time).toBe(true);
  });

  it('시작 시간이 종료 시간보다 늦으면 false를 반환한다', () => {
    const invalidTimeEvent = {
      title: '회의',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '09:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    } as EventForm;
    const result = validateEvent({
      event: invalidTimeEvent,
      error: { startTimeError: null, endTimeError: null },
    });
    expect(result.required).toBe(true);
    expect(result.time).toBe(false);
  });
  it('시작 시간이나 종료 시간에 대한 에러가 있으면 false를 반환한다', () => {
    const event = {
      title: '회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    } as EventForm;
    const result = validateEvent({
      event,
      error: { startTimeError: '시작 시간 오류', endTimeError: null },
    });
    expect(result.required).toBe(true);
    expect(result.time).toBe(false);
  });
});
