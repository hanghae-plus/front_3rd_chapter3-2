import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date(2024, 10, 3, 8), []);
    expect(upcomingEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const notifiedEvents = ['1'];

    const upcomingEvents = getUpcomingEvents(events, new Date(2024, 10, 3, 8), notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date(2024, 10, 3, 7), []);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const upcomingEvents = getUpcomingEvents(events, new Date(2024, 10, 3, 10), []);
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('notificationTime과 이벤트 id가 담긴 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '이벤트 1',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('60분 후 이벤트 1 일정이 시작됩니다.');
  });
});
