import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { generateRepeatEvents } from '../../utils/eventUtils';

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

describe('generateRepeatEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '반복 이벤트',
    date: '2024-01-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    notificationTime: 0,
    repeat: {
      type: 'none',
      interval: 1,
    },
  };

  it('반복이 없는 이벤트는 원본 이벤트만 반환한다', () => {
    const event = { ...baseEvent };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(event);
  });

  it('일간 반복 이벤트를 생성한다', () => {
    const event: Event = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-05',
      },
    };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(5);
    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
    ]);
  });

  it('격일 반복 이벤트를 생성한다', () => {
    const event: Event = {
      ...baseEvent,
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-01-05',
      },
    };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-03', '2024-01-05']);
  });

  it('주간 반복 이벤트를 생성한다', () => {
    const event: Event = {
      ...baseEvent,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-01-23',
      },
    };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(4);
    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2024-01-08',
      '2024-01-15',
      '2024-01-22',
    ]);
  });

  it('월간 반복 이벤트를 생성한다', () => {
    const event: Event = {
      ...baseEvent,
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-04-01',
      },
    };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(4);
    expect(result.map((e) => e.date)).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
      '2024-04-01',
    ]);
  });

  it('연간 반복 이벤트를 생성한다', () => {
    const event: Event = {
      ...baseEvent,
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-01-01',
      },
    };
    const result = generateRepeatEvents(event);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2025-01-01', '2026-01-01']);
  });

  describe('특수한 날짜 케이스 처리', () => {
    it('윤년의 2월 29일을 처리한다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2029-03-01',
        },
      };
      const result = generateRepeatEvents(event);
      expect(result.map((e) => e.date)).toEqual(['2024-02-29', '2028-02-29']);
    });

    it('월말일(31일)을 다음 달로 반복할 때 올바르게 처리한다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-04-30',
        },
      };
      const result = generateRepeatEvents(event);
      expect(result.map((e) => e.date)).toEqual(['2024-01-31', '2024-03-31']);
    });

    it('30일에 시작하는 월간 반복 일정을 올바르게 처리한다(2월 처리)', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-01-30',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-04-30' },
      };
      const result = generateRepeatEvents(event);
      expect(result.map((e) => e.date)).toEqual(['2024-01-30', '2024-03-30', '2024-04-30']);
    });
  });

  describe('예외 케이스 처리', () => {
    it('interval이 0 이하일 경우 원본 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        repeat: { type: 'daily', interval: 0, endDate: '2024-01-05' },
      };
      const result = generateRepeatEvents(event);
      expect(result).toHaveLength(1);
    });

    it('종료일이 시작일보다 이전인 경우 원본 이벤트만 반환한다', () => {
      const event: Event = {
        ...baseEvent,
        date: '2024-01-05',
        repeat: { type: 'daily', interval: 1, endDate: '2024-01-01' },
      };
      const result = generateRepeatEvents(event);
      expect(result).toHaveLength(1);
    });
  });
});
