import { Event } from '../../types';
import { generateRepeatEvents } from '../../utils/generateRepeatEvents';

describe('제약 조건', () => {
  it('반복 없는 이벤트는 단일 이벤트로 배열에 담겨 반환된다', () => {
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
    const result = generateRepeatEvents(event);

    expect(result).toEqual([event]);
  });

  it('endDate가 없으면 최대 날짜(2025-06-30)까지 생성된다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2023-05-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 15,
    };
    const result = generateRepeatEvents(event);
    const lastEvent = result[result.length - 1];

    expect(Date.parse(lastEvent.date)).toEqual(Date.parse('2025-06-30'));
  });
});

describe('일간 반복 테스트', () => {
  it("'2024-01-01'부터 '2024-01-03'까지 매일 반복하는 경우 '2024-01-01', '2024-01-02', '2024-01-03'이 된다", () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-01-03',
      },
      notificationTime: 15,
    };
    const result = generateRepeatEvents(event);
    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it("'2024-01-01'부터 '2024-01-05'까지 2일 간격으로 반복하는 경우 '2024-01-01', '2024-01-03', '2024-01-05'가 된다", () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-01-05',
      },
      notificationTime: 15,
    };
    const result = generateRepeatEvents(event);
    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-03', '2024-01-05']);
  });
});

describe('주간 반복 테스트', () => {
  it("'2024-01-01'를 기준으로 '2024-01-15'까지 매주 간격으로 생성하는 경우 '2024-01-01', '2024-01-08', '2024-01-15'가 된다", () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-01-15',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-08', '2024-01-15']);
  });

  it("'2024-01-01'를 기준으로 2주 간격으로 생성하는 경우 '2024-01-01', '2024-01-15', '2024-01-29'가 된다", () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2024-02-01',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-01-01', '2024-01-15', '2024-01-29']);
  });
});

describe('월간 반복 테스트', () => {
  it('2024-01-15를 기준으로 2024-03-15까지 매월 반복되는 이벤트의 날짜는 "2024-01-15", "2024-02-15", "2024-03-25"이다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-03-15',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-01-15', '2024-02-15', '2024-03-15']);
  });

  it('2024-01-15를 기준으로 2024-05-15까지 2달 반복되는 이벤트의 날짜는 "2024-01-15", "2024-03-15", "2024-05-25"이다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 2,
        endDate: '2024-05-15',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);
    expect(result.map((e) => e.date)).toEqual(['2024-01-15', '2024-03-15', '2024-05-15']);
  });

  it('24년 1월 31일을 기준으로 2024-04-30까지 매월 반복하는 경우 "2024-01-31", "2024-03-31"가 된다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-01-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-04-30',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-01-31', '2024-03-31']);
  });
});

describe('연간 반복 테스트', () => {
  it('매년 반복되는 이벤트를 정확히 생성해야 함', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-03-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-03-15',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-03-15', '2025-03-15', '2026-03-15']);
  });

  it('2년 간격으로 반복되는 이벤트를 정확히 생성해야 함', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-03-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly',
        interval: 2,
        endDate: '2028-03-15',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2024-03-15', '2026-03-15', '2028-03-15']);
  });

  it('윤년 날짜 처리를 정확히 해야 함', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      date: '2024-02-29', // 윤년
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2030-03-01',
      },
      notificationTime: 15,
    };

    const result = generateRepeatEvents(event);

    expect(result.map((e) => e.date)).toEqual(['2024-02-29', '2028-02-29']);
  });
});

it('interval이 0이면 단일 이벤트만 반환한다', () => {
  const event: Event = {
    id: '1',
    title: '중요 회의',
    date: '2024-02-29',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'daily',
      interval: 0,
      endDate: '2030-03-01',
    },
    notificationTime: 15,
  };

  const result = generateRepeatEvents(event);
  expect(result).toEqual([event]);
});
