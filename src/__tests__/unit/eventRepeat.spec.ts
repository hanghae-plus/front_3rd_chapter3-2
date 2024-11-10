import { RepeatType } from '../../types';
import { getNextEventDate, getRepeatEvents } from '../../utils/eventRepeat';

describe('getNextEventDate', () => {
  it('이벤트의 repeat type이 none이면 null을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toBeNull();
  });

  it('이벤트의 repeat type이 daily이고 interval이 1이면 다음 날을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-11'));
    expect(nextEventDate).toStrictEqual(new Date('2024-11-12'));
  });

  it('이벤트의 repeat type이 daily이고 interval이 2이면 다다음 날을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-11'));
    expect(nextEventDate).toStrictEqual(new Date('2024-11-13'));
  });

  it('이벤트의 repeat type이 weekly이고 interval이 1이면 일주일 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'weekly' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2024-11-17'));
  });

  it('이벤트의 repeat type이 weekly이고 interval이 2이면 이주 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'weekly' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2024-11-24'));
  });

  it('이벤트의 repeat type이 monthly이고 interval이 1이면 한 달 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2024-12-10'));
  });

  it('이벤트의 repeat type이 monthly이고 interval이 2이면 두달 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2025-01-10'));
  });

  it('이벤트의 repeat type이 yearly이고 interval이 1이면 일 년 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2025-11-10'));
  });

  it('이벤트의 repeat type이 yearly이고 interval이 2이면 이년 후를 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-11-10'));
    expect(nextEventDate).toStrictEqual(new Date('2026-11-10'));
  });

  it('2월 29일 설정된 이벤트의 repeat type이 yearly이면 다음 윤년의 2월 29일을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-02-29',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-02-29'));
    expect(nextEventDate).toStrictEqual(new Date('2028-02-29'));
  });

  it('2월 29일 설정된 이벤트의 repeat type이 yearly이고 interval이 2이면 다다음 윤년의 2월 29일을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-02-29',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-02-29'));
    expect(nextEventDate).toStrictEqual(new Date('2032-02-29'));
  });

  it('3월 31일 설정된 이벤트의 repeat type이 monthly이면 5월 31일을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-03-31',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-03-31'));
    expect(nextEventDate).toStrictEqual(new Date('2024-05-31'));
  });

  it('3월 31일 설정된 이벤트의 repeat type이 monthly이고 interval이 2이면 7월 31일을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-03-31',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 2,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-03-31'));
    expect(nextEventDate).toStrictEqual(new Date('2024-05-31'));
  });

  it('3월 31일 설정된 이벤트의 repeat type이 monthly이고 interval이 3이면 다음 해 1월 31일을 반환한다.', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-03-31',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 3,
        endDate: '',
      },
      notificationTime: 10,
    };

    const nextEventDate = getNextEventDate(event, new Date('2024-03-31'));
    expect(nextEventDate).toStrictEqual(new Date('2024-12-31'));
  });
});

describe('getRepeatEvents', () => {
  it('일간 반복에서 interval이 1일 때, 종료일까지 이벤트가 하루 간격으로 생성되어야 한다', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily' as RepeatType,
        interval: 1,
        endDate: '2024-11-12',
      },
      notificationTime: 10,
    };

    const events = getRepeatEvents(event);

    expect(events.length).toBe(3);
    expect(events[0].date).toBe('2024-11-10');
    expect(events[1].date).toBe('2024-11-11');
    expect(events[2].date).toBe('2024-11-12');
  });

  it('주간 반복에서 interval이 2일 때, 종료일까지 이벤트가 두 주 간격으로 생성되어야 한다', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'weekly' as RepeatType,
        interval: 2,
        endDate: '2024-11-24',
      },
      notificationTime: 10,
    };

    const events = getRepeatEvents(event);

    expect(events.length).toBe(2);
    expect(events[0].date).toBe('2024-11-10');
    expect(events[1].date).toBe('2024-11-24');
  });

  it('월간 반복에서 interval이 2일 때, 종료일까지 이벤트가 두 달 간격으로 생성되어야 한다', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly' as RepeatType,
        interval: 2,
        endDate: '2025-03-10',
      },
      notificationTime: 10,
    };

    const events = getRepeatEvents(event);

    expect(events.length).toBe(3);
    expect(events[0].date).toBe('2024-11-10');
    expect(events[1].date).toBe('2025-01-10');
    expect(events[2].date).toBe('2025-03-10');
  });

  it('연간 반복에서 interval이 3일 때, 종료일까지 이벤트가 3년 간격으로 생성되어야 한다', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 3,
        endDate: '2030-11-10',
      },
      notificationTime: 10,
    };

    const events = getRepeatEvents(event);

    expect(events.length).toBe(3);
    expect(events[0].date).toBe('2024-11-10');
    expect(events[1].date).toBe('2027-11-10');
    expect(events[2].date).toBe('2030-11-10');
  });

  it('연간 반복에서 interval이 10이고 종료일이 없을 때, 2050년까지 10년 간격으로 이벤트가 생성되어야 한다', () => {
    const event = {
      id: '1',
      title: 'test',
      date: '2024-11-10',
      startTime: '00:00',
      endTime: '00:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly' as RepeatType,
        interval: 10,
        endDate: '',
      },
      notificationTime: 10,
    };

    const events = getRepeatEvents(event);

    expect(events.length).toBe(3);
    expect(events[0].date).toBe('2024-11-10');
    expect(events[1].date).toBe('2034-11-10');
    expect(events[2].date).toBe('2044-11-10');
  });
});
