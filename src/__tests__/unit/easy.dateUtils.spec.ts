import { createEvent } from '../../__mocks__/Factory';
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
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  test.each(new Array(10).fill(0).map((_, i) => (i + 1) * 400))(
    '윤년의 2월에 대해 29일을 반환한다',
    (year) => {
      expect(year % 400).toBe(0);
      expect(getDaysInMonth(year, 2)).toBe(29);
    }
  );

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  test.each(new Array(10).fill(0).map((_, i) => (i + 1) * 400 + 1))(
    '평년의 2월에 대해 28일을 반환한다',
    (year) => {
      expect(getDaysInMonth(year, 2)).toBe(28);
    }
  );

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 24)).toBe(0);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // GIVEN: 2024년 10월 2일 수요일
    const wednesday = new Date('2024-10-02');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(wednesday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-09-29')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-09-30')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-10-01')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2024-10-02')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2024-10-03')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2024-10-04')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2024-10-05')); // 토요일
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // GIVEN: 2024년 10월 7일 월요일
    const monday = new Date('2024-10-07');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(monday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-10-06')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-10-07')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-10-08')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2024-10-09')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2024-10-10')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2024-10-11')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2024-10-12')); // 토요일
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    // GIVEN: 2024년 10월 6일 일요일
    const sunday = new Date('2024-10-06');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(sunday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-10-06')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-10-07')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-10-08')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2024-10-09')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2024-10-10')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2024-10-11')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2024-10-12')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    // GIVEN: 2024년 10월 31일 목요일
    const thursday = new Date('2024-10-31');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(thursday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-10-27')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-10-28')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-10-29')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2024-10-30')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2024-10-31')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2024-11-01')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2024-11-02')); // 토요일
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    // GIVEN: 2024년 10월 1일 화요일
    const tuesday = new Date('2024-10-01');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(tuesday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-09-29')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-09-30')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-10-01')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2024-10-02')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2024-10-03')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2024-10-04')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2024-10-05')); // 토요일
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    // GIVEN: 400년 2월 29일 화요일
    const tuesday = new Date('400-02-29');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(tuesday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('400-02-27')); // 일요일
    expect(weekDates[1]).toEqual(new Date('400-02-28')); // 월요일
    expect(weekDates[2]).toEqual(new Date('400-02-29')); // 화요일
    expect(weekDates[3]).toEqual(new Date('400-03-01')); // 수요일
    expect(weekDates[4]).toEqual(new Date('400-03-02')); // 목요일
    expect(weekDates[5]).toEqual(new Date('400-03-03')); // 금요일
    expect(weekDates[6]).toEqual(new Date('400-03-04')); // 토요일
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    // GIVEN: 2024년 12월 31일 화요일
    const tuesday = new Date('2024-12-31');

    // WHEN: 함수 호출 했을 때
    const weekDates = getWeekDates(tuesday);

    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDates).toHaveLength(7);

    expect(weekDates[0]).toEqual(new Date('2024-12-29')); // 일요일
    expect(weekDates[1]).toEqual(new Date('2024-12-30')); // 월요일
    expect(weekDates[2]).toEqual(new Date('2024-12-31')); // 화요일
    expect(weekDates[3]).toEqual(new Date('2025-01-01')); // 수요일
    expect(weekDates[4]).toEqual(new Date('2025-01-02')); // 목요일
    expect(weekDates[5]).toEqual(new Date('2025-01-03')); // 금요일
    expect(weekDates[6]).toEqual(new Date('2025-01-04')); // 토요일
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    // GIVEN: 2024년 07 01일
    const july = new Date('2024-07-01');

    // WHEN: 함수 호출 했을 때
    const weekDatesAtMonth = getWeeksAtMonth(july);
    // THEN: 주에 대한 정확한 날짜를 반환한다.
    expect(weekDatesAtMonth).toHaveLength(5);

    expect(weekDatesAtMonth[0]).toEqual([null, 1, 2, 3, 4, 5, 6]); // 첫째 주
    expect(weekDatesAtMonth[1]).toEqual([7, 8, 9, 10, 11, 12, 13]); // 두번째 주
    expect(weekDatesAtMonth[2]).toEqual([14, 15, 16, 17, 18, 19, 20]); // 셋째 주
    expect(weekDatesAtMonth[3]).toEqual([21, 22, 23, 24, 25, 26, 27]); // 넷째 주
    expect(weekDatesAtMonth[4]).toEqual([28, 29, 30, 31, null, null, null]); // 다섯째 주
  });
});

describe('getEventsForDay', () => {
  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    // GIVEN: 1일에 해당하는 이벤트 설정
    const date1MockData = [
      createEvent({ id: '1', date: '2024-01-01' }),
      createEvent({ id: '2', date: '2024-01-02' }),
      createEvent({ id: '3', date: '2024-01-03' }),
    ] as Event[];

    // WHEN: getEventsForDay 호출
    const eventsForDay = getEventsForDay(date1MockData as Event[], '2024-01-01');

    // THEN: 1일에 해당하는 결과만 반환한다.
    expect(eventsForDay).toEqual([createEvent({ id: '1', date: '2024-01-01' })]);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    // GIVEN: mock 이벤트 설정
    const dateMockData = [
      createEvent({ id: '1', date: '2024-01-01' }),
      createEvent({ id: '2', date: '2024-01-02' }),
      createEvent({ id: '3', date: '2024-01-03' }),
    ] as Event[];

    // WHEN: getEventsForDay 호출
    const eventsForDay = getEventsForDay([...dateMockData] as Event[], '2024-01-04');

    // THEN: 4일에 해당하는 결과만 반환한다.
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    // GIVEN: mock 이벤트 설정
    const dateMockData = [
      createEvent({ id: '1', date: '2024-01-01' }),
      createEvent({ id: '2', date: '2024-02-02' }),
      createEvent({ id: '3', date: '2024-03-03' }),
    ] as Event[];
    // WHEN: getEventsForDay 호출
    const eventsForDay = getEventsForDay(dateMockData, '2024-01-0');

    // THEN: 0일 경우 빈배열을 반환한다.
    expect(eventsForDay).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    // GIVEN: mock 이벤트 설정
    const dateMockData = [
      createEvent({ id: '1', date: '2024-01-01' }),
      createEvent({ id: '2', date: '2024-01-02' }),
      createEvent({ id: '3', date: '2024-01-03' }),
    ] as Event[];
    // WHEN: getEventsForDay 호출
    const eventsForDay = getEventsForDay(dateMockData, '2024-01-32');

    // THEN: 32일 경우 빈배열을 반환한다.
    expect(eventsForDay).toEqual([]);
  });
});

describe('formatWeek', () => {
  test.each([
    { date: '2024-01-01', result: '2024년 01월 1주' }, //월
    { date: '2024-02-29', result: '2024년 02월 5주' }, //목
    { date: '2024-10-16', result: '2024년 10월 3주' }, //수
    { date: '2024-02-02', result: '2024년 02월 1주' }, //금
    { date: '2024-07-26', result: '2024년 07월 4주' }, //금
  ])(
    '월의 중간 날짜에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );

  test.each([
    { date: '2024-09-01', result: '2024년 09월 1주' }, // 일
    { date: '2024-10-01', result: '2024년 10월 1주' }, // 화
    { date: '2024-11-01', result: '2024년 10월 5주' }, // 금
    { date: '2024-12-01', result: '2024년 12월 1주' }, // 일
  ])(
    '월의 첫 주에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );

  test.each([
    { date: '2023-02-28', result: '2023년 03월 1주' }, // 화 => 목 3월
    { date: '2024-09-30', result: '2024년 10월 1주' }, // 월 => 목 10월
    { date: '2024-10-31', result: '2024년 10월 5주' }, // 목
    { date: '2024-11-30', result: '2024년 11월 4주' }, // 토
    { date: '2024-12-31', result: '2025년 01월 1주' }, // 화 => 목 1월
  ])(
    '월의 마지막 주에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );

  test.each([
    { date: '2022-01-01', result: '2021년 12월 5주' }, // 토 => 목 21년 12월
    { date: '2022-12-31', result: '2022년 12월 5주' }, // 토
    { date: '2023-01-01', result: '2023년 01월 1주' }, // 일
    { date: '2023-12-31', result: '2024년 01월 1주' }, // 일 => 목 24년 1월
    { date: '2024-01-01', result: '2024년 01월 1주' }, // 월
    { date: '2024-12-31', result: '2025년 01월 1주' }, // 화 => 목 1월
  ])(
    '연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );

  test.each([
    { date: '2016-02-29', result: '2016년 03월 1주' }, // 월 => 목 3월
    { date: '2020-02-29', result: '2020년 02월 4주' }, // 토
    { date: '2024-02-29', result: '2024년 02월 5주' }, // 목
  ])(
    '윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );

  test.each([
    { date: '2022-02-28', result: '2022년 03월 1주' }, // 월 => 목 3월
    { date: '2023-02-28', result: '2023년 03월 1주' }, // 화 => 목 3월
    { date: '2025-02-28', result: '2025년 02월 4주' }, // 금
  ])(
    '평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다',
    ({ date, result }: { date: string; result: string }) => {
      const week = formatWeek(new Date(date));
      expect(week).toBe(result);
    }
  );
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
    const result = isDateInRange(new Date('2024-07-10'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-01'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const result = isDateInRange(new Date('2024-07-31'), rangeStart, rangeEnd);
    expect(result).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-06-30'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const result = isDateInRange(new Date('2024-08-01'), rangeStart, rangeEnd);
    expect(result).toBe(false);
  });

  test.each([
    { start: '2024-07-31', end: '2024-07-01' },
    { start: '2024-06-31', end: '2024-06-01' },
    { start: '2024-05-31', end: '2024-05-01' },
  ])(
    '시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다',
    ({ start, end }: { start: string; end: string }) => {
      const result = isDateInRange(new Date('2024-07-10'), new Date(start), new Date(end));
      expect(result).toBe(false);
    }
  );
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5, 2);
    expect(result).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    const result = fillZero(10, 2);
    expect(result).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    const result = fillZero(3, 3);
    expect(result).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100, 2);
    expect(result).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    const result = fillZero(0, 2);
    expect(result).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);
    expect(result).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    const result = fillZero(3.14, 5);
    expect(result).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    const result = fillZero(1);
    expect(result).toBe('01');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    const result = fillZero(1000000000, 5);
    expect(result).toBe('1000000000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date('2024-11-16');
    const result = formatDate(date);

    expect(result).toBe('2024-11-16');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date('2024-11-16');
    const result = formatDate(date, 10);

    expect(result).toBe('2024-11-10');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-01-06');
    const result = formatDate(date);

    expect(result).toBe('2024-01-06');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date('2024-11-01');
    const result = formatDate(date);

    expect(result).toBe('2024-11-01');
  });
});
