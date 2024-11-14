import { Event } from '../../types';
import { getFilteredEvents, getRecurringEventDisplay } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        id: '4',
        title: '6월 마지막 날 이벤트',
        date: '2024-06-30',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      ...events,
      {
        id: '5',
        title: '8월 첫 날 이벤트',
        date: '2024-08-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(borderEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});

describe('getRecurringEventDisplay', () => {
  const baseEvent = {
    id: '1',
    title: '테스트 일정',
    date: '2024-01-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    notificationTime: 0,
  };

  it('반복 일정이 아닌 경우 기본 표시 정보를 반환한다', () => {
    const event = { ...baseEvent };

    const display = getRecurringEventDisplay(event);
    expect(display).toEqual({
      icon: null,
      badge: null,
      className: '',
    });
  });

  it('일간 반복 일정의 표시 정보를 반환한다', () => {
    const event = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-10',
      },
    };

    const display = getRecurringEventDisplay(event);
    expect(display).toEqual({
      icon: 'repeat-daily',
      badge: '매일',
      className: 'recurring-event recurring-daily',
    });
  });

  it('주간 반복 일정의 표시 정보를 반환한다', () => {
    const event = {
      ...baseEvent,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-02-01',
      },
    };

    const display = getRecurringEventDisplay(event);
    expect(display).toEqual({
      icon: 'repeat-weekly',
      badge: '매주',
      className: 'recurring-event recurring-weekly',
    });
  });

  it('월간 반복 일정의 표시 정보를 반환한다', () => {
    const event = {
      ...baseEvent,
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-01',
      },
    };

    const display = getRecurringEventDisplay(event);
    expect(display).toEqual({
      icon: 'repeat-monthly',
      badge: '매월',
      className: 'recurring-event recurring-monthly',
    });
  });

  it('반복 간격이 1이 아닌 경우 적절한 뱃지 텍스트를 반환한다', () => {
    const event = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-01-10',
      },
    };

    const display = getRecurringEventDisplay(event);
    expect(display.badge).toBe('2일마다');
  });

  describe('특수한 반복 패턴', () => {
    it('종료일이 없는 반복 일정을 처리한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: null,
        },
      };

      const display = getRecurringEventDisplay(event);
      expect(display.badge).toBe('매일');
      expect(display.className).toContain('recurring-infinite');
    });

    it('잘못된 반복 타입에 대해 기본 표시 정보를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'invalid-type' as any,
          interval: 1,
          endDate: '2024-01-10',
        },
      };

      const display = getRecurringEventDisplay(event);
      expect(display).toEqual({
        icon: null,
        badge: null,
        className: '',
      });
    });
  });
});
