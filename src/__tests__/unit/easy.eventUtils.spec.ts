import { Event } from '../../types';
import {
  getFilteredEvents,
  getRecurringEventDisplay,
  isRecurringEventEnded,
  convertToSingleEvent,
  deleteRecurringEventInstance,
} from '../../utils/eventUtils';

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

describe('isRecurringEventEnded', () => {
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

  describe('특정 날짜까지 반복', () => {
    it('종료 날짜 이전이면 false를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2024-12-31',
          endType: 'date' as const,
        },
      };

      expect(isRecurringEventEnded(event, new Date('2024-06-15'))).toBeFalsy();
    });

    it('종료 날짜 이후면 true를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2024-12-31',
          endType: 'date' as const,
        },
      };

      expect(isRecurringEventEnded(event, new Date('2025-01-01'))).toBeTruthy();
    });
  });

  describe('특정 횟수만큼 ��복', () => {
    it('지정된 횟수 이전이면 false를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endType: 'count' as const,
          endCount: 10,
          currentCount: 5,
        },
      };

      expect(isRecurringEventEnded(event)).toBeFalsy();
    });

    it('지정된 횟수에 도달하면 true를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'weekly',
          interval: 1,
          endType: 'count' as const,
          endCount: 10,
          currentCount: 10,
        },
      };

      expect(isRecurringEventEnded(event)).toBeTruthy();
    });
  });

  describe('종료 없음', () => {
    it('종료 타입이 never면 false를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endType: 'never' as const,
        },
      };

      expect(isRecurringEventEnded(event)).toBeFalsy();
    });

    it('예제 특성상 2025-06-30 이후면 true를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'monthly',
          interval: 1,
          endType: 'never' as const,
        },
      };

      expect(isRecurringEventEnded(event, new Date('2025-07-01'))).toBeTruthy();
    });
  });

  describe('예외 케이스', () => {
    it('반복 설정이 없는 일정은 true를 반환한다', () => {
      const event = { ...baseEvent };
      expect(isRecurringEventEnded(event)).toBeTruthy();
    });

    it('잘못된 종료 타입이면 true를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endType: 'invalid' as any,
        },
      };

      expect(isRecurringEventEnded(event)).toBeTruthy();
    });

    it('종료 날짜가 유효하지 않은 형식이면 true를 반환한다', () => {
      const event = {
        ...baseEvent,
        repeat: {
          type: 'daily',
          interval: 1,
          endType: 'date' as const,
          endDate: 'invalid-date',
        },
      };

      expect(isRecurringEventEnded(event)).toBeTruthy();
    });
  });
});

describe('convertToSingleEvent', () => {
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
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-12-31',
      endType: 'date' as const,
    },
  };

  it('반복 일정을 단일 일정으로 변경한다', () => {
    const updatedEvent = {
      ...baseEvent,
      title: '수정된 일정',
      description: '설명 추가',
    };

    const result = convertToSingleEvent(baseEvent, updatedEvent);

    // repeat 속성이 제거되었는지 확인
    expect(result.repeat).toBeUndefined();

    // 수정된 내용이 반영되었는지 확인
    expect(result.title).toBe('수정된 일정');
    expect(result.description).toBe('설명 추가');

    // 기존 속성이 유지되는지 확인
    expect(result.date).toBe(baseEvent.date);
    expect(result.startTime).toBe(baseEvent.startTime);
    expect(result.endTime).toBe(baseEvent.endTime);
  });

  it('이미 단일 일정인 경우 그대로 수정 사항만 반영한다', () => {
    const singleEvent = {
      ...baseEvent,
      repeat: undefined,
    };

    const updatedEvent = {
      ...singleEvent,
      title: '수정된 일정',
    };

    const result = convertToSingleEvent(singleEvent, updatedEvent);

    expect(result.repeat).toBeUndefined();
    expect(result.title).toBe('수정된 일정');
  });

  it('수정 내용이 없는 경우 repeat 속성만 제거한다', () => {
    const result = convertToSingleEvent(baseEvent, baseEvent);

    expect(result.repeat).toBeUndefined();
    expect(result).toEqual({
      ...baseEvent,
      repeat: undefined,
    });
  });

  describe('예외 처리', () => {
    it('원본 이벤트가 없는 경우 null을 반환한다', () => {
      const result = convertToSingleEvent(null as any, baseEvent);
      expect(result).toBeNull();
    });

    it('수정할 이벤트가 없는 경우 원본에서 repeat만 제거하여 반환한다', () => {
      const result = convertToSingleEvent(baseEvent, null as any);

      expect(result.repeat).toBeUndefined();
      expect(result).toEqual({
        ...baseEvent,
        repeat: undefined,
      });
    });

    it('ID가 다른 이벤트인 경우 null을 반환한다', () => {
      const differentEvent = {
        ...baseEvent,
        id: '2',
      };

      const result = convertToSingleEvent(baseEvent, differentEvent);
      expect(result).toBeNull();
    });
  });
});

describe('deleteRecurringEventInstance', () => {
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
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-12-31',
      endType: 'date' as const,
      excludeDates: [],
    },
  };

  it('반복 일정의 특정 날짜를 제외 목록에 추가한다', () => {
    const targetDate = '2024-01-15';
    const result = deleteRecurringEventInstance(baseEvent, targetDate);

    expect(result.repeat?.excludeDates).toContain(targetDate);
    expect(result.repeat?.excludeDates).toHaveLength(1);

    // 원본 이벤트의 다른 속성들은 변경되지 않아야 함
    expect(result.id).toBe(baseEvent.id);
    expect(result.title).toBe(baseEvent.title);
    expect(result.repeat?.type).toBe(baseEvent.repeat?.type);
  });

  it('이미 제외된 날짜를 다시 추가하지 않는다', () => {
    const eventWithExclude = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        excludeDates: ['2024-01-15'],
      },
    };

    const result = deleteRecurringEventInstance(eventWithExclude, '2024-01-15');
    expect(result.repeat?.excludeDates).toHaveLength(1);
    expect(result.repeat?.excludeDates).toContain('2024-01-15');
  });

  it('여러 날짜를 제외 목록에 추가할 수 있다', () => {
    let event = baseEvent;
    const dates = ['2024-01-15', '2024-01-16', '2024-01-17'];

    dates.forEach((date) => {
      event = deleteRecurringEventInstance(event, date);
    });

    expect(event.repeat?.excludeDates).toHaveLength(3);
    dates.forEach((date) => {
      expect(event.repeat?.excludeDates).toContain(date);
    });
  });

  describe('예외 처리', () => {
    it('반복 일정이 아닌 경우 null을 반환한다', () => {
      const nonRecurringEvent = { ...baseEvent, repeat: undefined };
      const result = deleteRecurringEventInstance(nonRecurringEvent, '2024-01-15');
      expect(result).toBeNull();
    });

    it('유효하지 않은 날짜 형식인 경우 null을 반환한다', () => {
      const result = deleteRecurringEventInstance(baseEvent, 'invalid-date');
      expect(result).toBeNull();
    });

    it('반복 일정 범위를 벗어난 날짜인 경우 null을 반환한다', () => {
      const result = deleteRecurringEventInstance(baseEvent, '2025-01-01');
      expect(result).toBeNull();
    });

    it('excludeDates가 없는 경우 새로 생성한다', () => {
      const eventWithoutExcludeDates = {
        ...baseEvent,
        repeat: {
          ...baseEvent.repeat,
          excludeDates: undefined,
        },
      };

      const result = deleteRecurringEventInstance(eventWithoutExcludeDates, '2024-01-15');
      expect(result.repeat?.excludeDates).toBeDefined();
      expect(result.repeat?.excludeDates).toContain('2024-01-15');
    });
  });
});
