import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2023-05-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2023-05-10',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2023-05-11',
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
    const now = new Date('2023-05-10T09:50:00');
    const notifiedEvents: number[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].title).toBe('이벤트 1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2023-05-10T13:35:00');
    const notifiedEvents: number[] = [1];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].title).toBe('이벤트 2');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2023-05-10T09:00:00');
    const notifiedEvents: number[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2023-05-10T10:01:00');
    const notifiedEvents: number[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2023-05-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };
    const message = createNotificationMessage(event);
    expect(message).toBe('15분 후 중요 회의 일정이 시작됩니다.');
  });
});
