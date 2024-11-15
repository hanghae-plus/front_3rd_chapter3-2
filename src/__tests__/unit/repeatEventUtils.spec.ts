// repeatEvent를 date, interval에 맞게 추출해내는 로직을 만들어야함.

import dayjs from 'dayjs';

import { Event, EventForm } from '../../types';
import { getRepeatingEvent } from '../../utils/repeatEventUtils';

describe('getRepeatingEvent', () => {
  // 요구사항 1-1?
  it('repeat.type이 none이 아닌 경우에만 반환한다.', () => {
    const event: Event = {
      id: '2ab06561-10f8-4e7f-8128-4b2dd343c6b9',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const repeatEvents = getRepeatingEvent(event);

    expect(repeatEvents).toHaveLength(0);
  });

  // 요구사항 2
  it('반복일정 타입만큼의 간격을 설정할 수 있다.', () => {
    const events: Event = {
      id: '3b9487dd-b5e9-4ebe-8a9d-e85c46b89e0d',
      title: '마틴 외데고르',
      date: '2024-11-13',
      startTime: '04:25',
      endTime: '16:25',
      description: '아스날',
      location: '런던',
      category: '개인',
      repeat: { type: 'monthly', interval: 2 },
      notificationTime: 10,
    };
    const repeatEvents = getRepeatingEvent(events);

    expect(repeatEvents[0].date).toBe('2025-01-13');
    expect(repeatEvents[1].date).toBe('2025-03-13');
    expect(repeatEvents[2].date).toBe('2025-05-13');
  });

  // 요구사항 4
  it('repeat.eventDate속성이 없을 경우, 반환값의 date는 2025-06-30을 넘기지 않는다.', () => {
    const events: Event = {
      id: '3b9487dd-b5e9-4ebe-8a9d-e85c46b89e0d',
      title: '부카요 사카',
      date: '2024-11-13',
      startTime: '04:25',
      endTime: '16:25',
      description: '아스날',
      location: '런던',
      category: '개인',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 10,
    };

    const repeatEvents = getRepeatingEvent(events);
    const lastRepeatingEvent = repeatEvents.at(-1) as Event;

    expect(dayjs(lastRepeatingEvent.date).isBefore('2025-06-30')).toBe(true);
  });

  //요구사항 1-2
  it('매월 31, 30일 등에 등록할 경우 그 날짜가 없을때 그 월의 말일에 등록한다.', () => {
    const events: Event = {
      id: '3b9487dd-b5e9-4ebe-8a9d-e85c46b89e0d',
      title: '데클란 라이스',
      date: '2024-01-31',
      startTime: '04:25',
      endTime: '16:25',
      description: '아스날',
      location: '런던',
      category: '개인',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
      notificationTime: 10,
    };

    const repeatEvents: EventForm[] = getRepeatingEvent(events);
    const repeatEventFeb = repeatEvents.find((event) => event.date.includes('2024-02'));
    const repeatEventJune = repeatEvents.find((event) => event.date.includes('2024-06'));

    expect(repeatEventFeb?.date).toBe('2024-02-29');
    expect(repeatEventJune?.date).toBe('2024-06-30');
  });

  // 요구사항 7-1

  it('특정 날짜를 제외하고 반환할 수 있다.', () => {
    const events: Event = {
      id: '3b9487dd-b5e9-4ebe-8a9d-e85c46b89e0d',
      title: '데클란 라이스',
      date: '2024-01-31',
      startTime: '04:25',
      endTime: '16:25',
      description: '아스날',
      location: '런던',
      category: '개인',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
      notificationTime: 10,
    };

    const repeatEvents: EventForm[] = getRepeatingEvent(events, '2024-03-31');
    const rpeeatEventMarch = repeatEvents.find((event) => event.date.includes('2024-03-31'));
    expect(rpeeatEventMarch).toBeUndefined();
  });
});
