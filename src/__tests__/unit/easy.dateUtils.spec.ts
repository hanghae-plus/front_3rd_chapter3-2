import { Event } from '../../types';

import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '@/features/event/lib/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    const days = getDaysInMonth(2024, 1);
    expect(days).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    const days = getDaysInMonth(2024, 4);
    expect(days).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    const days = getDaysInMonth(2024, 2);
    expect(days).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    const days = getDaysInMonth(2023, 2);
    expect(days).toBe(28);
  });

  // 원래는 0을 반환했는데 이는 테스트케이스가 모호하기 때문에 -1을 반환한다.
  it('유효하지 않은 월에 대해 -1을 반환한다', () => {
    const days = getDaysInMonth(2024, 14);
    expect(days).toBe(-1);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2024-11-06'));
    expect(weekDates).toEqual([
      new Date('2024-11-03'),
      new Date('2024-11-04'),
      new Date('2024-11-05'),
      new Date('2024-11-06'),
      new Date('2024-11-07'),
      new Date('2024-11-08'),
      new Date('2024-11-09'),
    ]);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2024-11-04'));
    expect(weekDates).toEqual([
      new Date('2024-11-03'),
      new Date('2024-11-04'),
      new Date('2024-11-05'),
      new Date('2024-11-06'),
      new Date('2024-11-07'),
      new Date('2024-11-08'),
      new Date('2024-11-09'),
    ]);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const weekDates = getWeekDates(new Date('2024-11-09'));
    expect(weekDates).toEqual([
      new Date('2024-11-03'),
      new Date('2024-11-04'),
      new Date('2024-11-05'),
      new Date('2024-11-06'),
      new Date('2024-11-07'),
      new Date('2024-11-08'),
      new Date('2024-11-09'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const weekDates = getWeekDates(new Date('2024-12-31'));
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const weekDates = getWeekDates(new Date('2025-01-01'));
    expect(weekDates).toEqual([
      new Date('2024-12-29'),
      new Date('2024-12-30'),
      new Date('2024-12-31'),
      new Date('2025-01-01'),
      new Date('2025-01-02'),
      new Date('2025-01-03'),
      new Date('2025-01-04'),
    ]);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const weekDates = getWeekDates(new Date('2024-02-29'));
    expect(weekDates).toEqual([
      new Date('2024-02-25'),
      new Date('2024-02-26'),
      new Date('2024-02-27'),
      new Date('2024-02-28'),
      new Date('2024-02-29'),
      new Date('2024-03-01'),
      new Date('2024-03-02'),
    ]);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const lastDayOfMonth = new Date('2024-03-31');
    const weekDates = getWeekDates(lastDayOfMonth);
    expect(weekDates).toEqual([
      new Date('2024-03-31'),
      new Date('2024-04-01'),
      new Date('2024-04-02'),
      new Date('2024-04-03'),
      new Date('2024-04-04'),
      new Date('2024-04-05'),
      new Date('2024-04-06'),
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const weeks = getWeeksAtMonth(new Date('2024-07-01'));
    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '생일 파티',
      date: '2024-11-04',
      startTime: '18:00',
      endTime: '21:00',
      description: '친구의 생일 파티',
      location: '내 집',
      category: '사교',
      repeat: {
        type: 'yearly',
        interval: 1,
      },
      notificationTime: 60,
    },
    {
      id: '3',
      title: '프로젝트 마감',
      date: '2024-11-21',
      startTime: '09:00',
      endTime: '17:00',
      description: '프로젝트 제출 마감일',
      location: '온라인',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 120,
    },
  ];
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 1);
    expect(eventsForDay).toEqual([events[0]]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const days = getEventsForDay(events, 2);
    expect(days).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 0);
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const eventsForDay = getEventsForDay(events, 32);
    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-11-15'));
    expect(week).toBe('2024년 11월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-11-01'));
    expect(week).toBe('2024년 10월 5주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-11-30'));
    expect(week).toBe('2024년 11월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-12-31'));
    expect(week).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2024-02-29'));
    expect(week).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const week = formatWeek(new Date('2023-02-28'));
    expect(week).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const month = formatMonth(new Date('2024-07-10'));
    expect(month).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(rangeStart, rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const isInRange = isDateInRange(rangeEnd, rangeStart, rangeEnd);
    expect(isInRange).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2024-06-30'), rangeStart, rangeEnd);
    expect(isInRange).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2024-08-01'), rangeStart, rangeEnd);
    expect(isInRange).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const isInRange = isDateInRange(new Date('2024-08-01'), rangeEnd, rangeStart);
    expect(isInRange).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const filled = fillZero(5);
    expect(filled).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const filled = fillZero(10);
    expect(filled).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const filled = fillZero(3, 3);
    expect(filled).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const filled = fillZero(100);
    expect(filled).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const filled = fillZero(0);
    expect(filled).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const filled = fillZero(1, 5);
    expect(filled).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const filled = fillZero(3.14, 5);
    expect(filled).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const filled = fillZero(5);
    expect(filled).toBe('05');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const filled = fillZero(12345, 3);
    expect(filled).toBe('12345');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2024-11-01T00:00:00Z'));
    expect(formatted).toBe('2024-11-01');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const formatted = formatDate(new Date('2024-11-01'), 10);
    expect(formatted).toBe('2024-11-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2024-1-10'), 10);
    expect(formatted).toBe('2024-01-10');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const formatted = formatDate(new Date('2024-11-1'), 1);
    expect(formatted).toBe('2024-11-01');
  });
});
