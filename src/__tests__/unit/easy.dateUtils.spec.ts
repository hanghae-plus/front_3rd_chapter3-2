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
  getRecurringDates,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31); // 1월
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30); // 4월
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29); // 2024년은 윤년
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28); // 2023년은 평년
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 0)).toBe(31); // 0은 이전 해의 12월로 처리됨
    expect(getDaysInMonth(2024, 13)).toBe(31); // 13은 다음 해의 1월로 처리됨
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-10'); // 수요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-07-07'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-07-13'); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-08'); // 월요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-07-07'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-07-13'); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date('2024-07-13'); // 토요일
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-07-07'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-07-13'); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date('2024-12-30'); // 월요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04'); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date('2025-01-01'); // 수요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-12-29'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2025-01-04'); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-02-29'); // 목요일 (윤년)
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-02-25'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-03-02'); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date('2024-04-30'); // 화요일
    const weekDates = getWeekDates(date);
    expect(weekDates[0].toISOString().split('T')[0]).toBe('2024-04-28'); // 일요일
    expect(weekDates[6].toISOString().split('T')[0]).toBe('2024-05-04'); // 토요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const testDate = new Date('2024-07-01');
    const weeks = getWeeksAtMonth(testDate);
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
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-01',
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
      date: '2024-07-02',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const dayEvents = getEventsForDay(events, 1);
    expect(dayEvents).toHaveLength(2);
    expect(dayEvents[0].title).toBe('이벤트 1');
    expect(dayEvents[1].title).toBe('이벤트 2');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 3);
    expect(dayEvents).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 0);
    expect(dayEvents).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const dayEvents = getEventsForDay(events, 32);
    expect(dayEvents).toHaveLength(0);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-10');
    expect(formatWeek(date)).toBe('2024년 7월 2주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-01');
    expect(formatWeek(date)).toBe('2024년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-07-31');
    expect(formatWeek(date)).toBe('2024년 8월 1주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-12-31');
    expect(formatWeek(date)).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2024-02-29');
    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date('2023-02-28');
    expect(formatWeek(date)).toBe('2023년 3월 1주');
  });
});

describe('formatMonth', () => {
  test("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');
    expect(formatMonth(date)).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeStart, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    expect(isDateInRange(rangeEnd, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const outOfRangeDate = new Date('2024-06-30');
    expect(isDateInRange(outOfRangeDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const outOfRangeDate = new Date('2024-08-01');
    expect(isDateInRange(outOfRangeDate, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2024-07-31');
    const invalidRangeEnd = new Date('2024-07-01');
    const testDate = new Date('2024-07-15');
    expect(isDateInRange(testDate, invalidRangeStart, invalidRangeEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(7)).toBe('07');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(1000, 3)).toBe('1000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const testDate = new Date('2023-05-10');
    expect(formatDate(testDate)).toBe('2023-05-10');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const testDate = new Date('2023-05-10');
    expect(formatDate(testDate, 15)).toBe('2023-05-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testDate = new Date('2023-01-20');
    expect(formatDate(testDate)).toBe('2023-01-20');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const testDate = new Date('2023-12-05');
    expect(formatDate(testDate)).toBe('2023-12-05');
  });
});

describe('getRecurringDates', () => {
  const sampleEvent: Event = {
    id: '1',
    title: '주간 팀 회의',
    date: '2024-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 업무 보고 및 계획 수립',
    location: '회의실 A',
    category: '',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 10,
  };

  it('매주 월요일 반복 일정을 올바르게 생성한다', () => {
    const dates = getRecurringDates(sampleEvent);

    // 2024년 7월 1일부터 12월 30일까지의 모든 월요일
    expect(dates).toContainEqual(new Date('2024-07-01'));
    expect(dates).toContainEqual(new Date('2024-07-08'));
    expect(dates).toContainEqual(new Date('2024-12-23'));
    expect(dates).toContainEqual(new Date('2024-12-30'));
    expect(dates).toHaveLength(27); // 7월부터 12월까지의 월요일 수
  });

  it('특정 날짜를 제외한 반복 일정을 생성한다', () => {
    const eventWithExclusion = {
      ...sampleEvent,
      excludeDates: ['2024-09-16'], // 추석
    };

    const dates = getRecurringDates(eventWithExclusion);
    expect(dates).not.toContainEqual(new Date('2024-09-16'));
    expect(dates).toHaveLength(26); // 전체 27개 중 1개 제외
  });

  it('반복 종료일 이후의 일정은 생성하지 않는다', () => {
    const dates = getRecurringDates(sampleEvent);
    const lastDate = new Date('2024-12-30');

    dates.forEach((date) => {
      expect(date.getTime()).toBeLessThanOrEqual(lastDate.getTime());
    });
  });

  describe('반복 일정 수정', () => {
    it('특정 날짜 이후의 모든 일정을 수정할 수 있다', () => {
      const modifiedEvent = {
        ...sampleEvent,
        endTime: '11:30',
        modifyFrom: '2024-09-02',
      };

      const dates = getRecurringDates(modifiedEvent);
      const modifiedDates = dates.filter(
        (date) => date.getTime() >= new Date('2024-09-02').getTime()
      );

      modifiedDates.forEach((date) => {
        expect(getEventTime(date).endTime).toBe('11:30');
      });
    });
  });

  describe('엣지 케이스 처리', () => {
    it('윤년의 2월 29일에 설정된 매월 반복을 올바르게 처리한다', () => {
      const leapYearEvent = {
        ...sampleEvent,
        date: '2024-02-29',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-31',
        },
      };

      const dates = getRecurringDates(leapYearEvent);
      expect(dates).toContainEqual(new Date('2024-02-29'));
      expect(dates).toContainEqual(new Date('2024-03-29'));
      // 2025년 2월은 28일까지만 있으므로 28일로 조정
      expect(dates).toContainEqual(new Date('2025-02-28'));
    });

    it('31일에 설정된 매월 반복을 올바르게 처리한다', () => {
      const monthEndEvent = {
        ...sampleEvent,
        date: '2024-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-04-30',
        },
      };

      const dates = getRecurringDates(monthEndEvent);
      expect(dates).toContainEqual(new Date('2024-01-31'));
      expect(dates).toContainEqual(new Date('2024-02-29')); // 윤년 2월
      expect(dates).toContainEqual(new Date('2024-03-31'));
      expect(dates).toContainEqual(new Date('2024-04-30'));
    });
  });
});
