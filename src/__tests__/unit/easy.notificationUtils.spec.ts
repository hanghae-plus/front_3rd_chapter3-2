import { createEvent } from '../../__mocks__/Factory';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const MOCK_EVENTS = [
  createEvent({
    id: '1',
    startTime: '00:30',
    endTime: '01:00',
    date: '2024-10-01',
    notificationTime: 30,
    title: 'EVENT 1',
  }),
  createEvent({
    id: '2',
    startTime: '01:00',
    endTime: '02:00',
    date: '2024-10-01',
    notificationTime: 10,
    title: 'EVENT 2',
  }),
] as Event[];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(MOCK_EVENTS, new Date(), new Set(), new Set());
    expect(result).toEqual([MOCK_EVENTS[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    vi.advanceTimersByTime(1000 * 60 * 10); //10분 후
    const result = getUpcomingEvents(MOCK_EVENTS, new Date(), new Set(), new Set());
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    vi.advanceTimersByTime(1000 * 60 * 60); // 1시간 후
    const result = getUpcomingEvents(MOCK_EVENTS, new Date(), new Set(), new Set());
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    vi.advanceTimersByTime(1000 * 60 * 60 * 2); // 2시간 후
    const result = getUpcomingEvents(MOCK_EVENTS, new Date(), new Set(), new Set());
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  test.each([MOCK_EVENTS])('올바른 알림 메시지를 생성해야 한다', (event: Event) => {
    const result = createNotificationMessage(event);
    expect(result).toBe(`${event.notificationTime}분 후 ${event.title} 일정이 시작됩니다.`);
  });
});
