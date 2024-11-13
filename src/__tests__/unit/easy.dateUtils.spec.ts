import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getMonth,
  getNthWeekday,
  getRemainingDatesByDay,
  getRemainingDatesByMonth,
  getRemainingDatesByWeek,
  getRemainingDatesByYear,
  getWeekDates,
  getWeekday,
  getWeeksAtMonth,
  isDateInRange,
  isLeapYear,
  isValidDate,
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

describe('isLeapYear', () => {
  it('🟢 4로 나뉘어 떨어지는 해는 윤년이다.', () => {
    const testDate = new Date(2024, 0);
    expect(isLeapYear(testDate)).toBe(true);
  });
  it('🔴 100으로 나뉘어 떨어지는 해는 윤년이 아니다.', () => {
    const testDate = new Date(2100, 0);
    expect(isLeapYear(testDate)).toBe(false);
  });
  it('🟢 400으로 나뉘어 떨어지는 해는 윤년이다.', () => {
    const testDate = new Date(2000, 0);
    expect(isLeapYear(testDate)).toBe(true);
  });
});

describe('getRemainingDatesByDay', () => {
  it('🟢 간격에 대한 입력이 1일 경우 다음날부터 종료일자까지 하루 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(49);
    expect(result[0]).toEqual(new Date('2024-11-13'));
    expect(result[1]).toEqual(new Date('2024-11-14'));
    expect(result[2]).toEqual(new Date('2024-11-15'));
    expect(result[47]).toEqual(new Date('2024-12-30'));
    expect(result[48]).toEqual(new Date('2024-12-31'));
  });
  it('🔴 종료일자가 현재일자보다 이전인 경우 빈 배열을 반환한다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-05-13');
    expect(getRemainingDatesByDay(currentDate, endDate)).toHaveLength(0);
  });
  it('🔴 간격이 0보다 작거나 같을 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 0;
    expect(getRemainingDatesByDay(currentDate, endDate, interval)).toHaveLength(0);
  });
  it('🔴 간격에 대한 입력이 없을 경우 기본값 1로 설정된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2025-01-01');
    const result = getRemainingDatesByDay(currentDate, endDate);
    expect(result).toHaveLength(50);
    expect(result[0]).toEqual(new Date('2024-11-13'));
    expect(result[1]).toEqual(new Date('2024-11-14'));
  });
  it('🟢 간격에 대한 입력이 2일 경우 종료일자까지 이틀 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 2;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(24);
    expect(result[0]).toEqual(new Date('2024-11-14'));
    expect(result[1]).toEqual(new Date('2024-11-16'));
    expect(result[22]).toEqual(new Date('2024-12-28'));
    expect(result[23]).toEqual(new Date('2024-12-30'));
  });
  it('🟢 간격에 대한 입력이 5일 경우 종료일자까지 닷새 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 5;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual(new Date('2024-11-17'));
    expect(result[1]).toEqual(new Date('2024-11-22'));
    expect(result[7]).toEqual(new Date('2024-12-22'));
    expect(result[8]).toEqual(new Date('2024-12-27'));
  });
  it('🟢 간격에 대한 입력이 7일 경우 종료일자까지 7일 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 7;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2024-11-19'));
    expect(result[1]).toEqual(new Date('2024-11-26'));
    expect(result[5]).toEqual(new Date('2024-12-24'));
    expect(result[6]).toEqual(new Date('2024-12-31'));
  });
  it('🟢 간격에 대한 입력이 15일 경우 종료일자까지 15일 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 15;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Date('2024-11-27'));
    expect(result[1]).toEqual(new Date('2024-12-12'));
    expect(result[2]).toEqual(new Date('2024-12-27'));
  });
  it('🟢 간격에 대한 입력이 30일 경우 종료일자까지 15일 간격으로 모든 날짜가 반환된다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2025-02-13');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Date('2024-12-12'));
    expect(result[1]).toEqual(new Date('2025-01-11'));
    expect(result[2]).toEqual(new Date('2025-02-10'));
  });
  it('🔴 올바르지 않은 현재일자의 월의 날짜의 경우 빈 배열을 반환한다.', () => {
    const currentDate = new Date('2024-13-12');
    const endDate = new Date('2025-02-13');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(0);
  });
  it('🔴 올바르지 않은 현재일자의 일의 날짜의 경우 빈 배열을 반환한다.', () => {
    const currentDate = new Date('2024-12-56');
    const endDate = new Date('2025-02-13');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(0);
  });
  it('🔴 올바르지 않은 종료일자의 월의 날짜의 경우 빈 배열을 반환한다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2025-22-13');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(0);
  });
  it('🔴 올바르지 않은 종료일자의 일의 날짜의 경우 빈 배열을 반환한다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2025-02-99');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(0);
  });
  it('🔴 시작일자가 존재하지 않을 경우 현재일자를 기준으로 계산하여 날짜 배열을 반환한다.', () => {
    const currentDate = undefined;
    const endDate = new Date('2025-02-13');
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual(new Date('2024-10-31'));
    expect(result[1]).toEqual(new Date('2024-11-30'));
    expect(result[2]).toEqual(new Date('2024-12-30'));
    expect(result[3]).toEqual(new Date('2025-01-29'));
  });
  it('🔴 종료일자가 존재하지 않을 경우 최대 종료일자 기준으로 계산하여 날짜 배열을 반환한다.', () => {
    const currentDate = undefined;
    const endDate = undefined;
    const interval = 30;
    const result = getRemainingDatesByDay(currentDate, endDate, interval);
    expect(result).toHaveLength(9);
    expect(result[0]).toEqual(new Date('2024-10-31'));
    expect(result[1]).toEqual(new Date('2024-11-30'));
    expect(result[2]).toEqual(new Date('2024-12-30'));
    expect(result[7]).toEqual(new Date('2025-05-29'));
    expect(result[8]).toEqual(new Date('2025-06-28'));
  });
});

describe('getWeekday', () => {
  it('🟢 월요일은 "mon"을 반환합니다.', () => {
    const testDate = new Date('2024-11-11');
    expect(getWeekday(testDate)).toBe('mon');
  });
  it('🟢 화요일은 "tue"을 반환합니다.', () => {
    const testDate = new Date('2024-11-12');
    expect(getWeekday(testDate)).toBe('tue');
  });
  it('🟢 수요일은 "wed"을 반환합니다.', () => {
    const testDate = new Date('2024-11-13');
    expect(getWeekday(testDate)).toBe('wed');
  });
  it('🟢 목요일은 "thu"을 반환합니다.', () => {
    const testDate = new Date('2024-11-14');
    expect(getWeekday(testDate)).toBe('thu');
  });
  it('🟢 금요일은 "fri"을 반환합니다.', () => {
    const testDate = new Date('2024-11-15');
    expect(getWeekday(testDate)).toBe('fri');
  });
  it('🟢 토요일은 "sat"을 반환합니다.', () => {
    const testDate = new Date('2024-11-16');
    expect(getWeekday(testDate)).toBe('sat');
  });
  it('🟢 일요일은 "sun"을 반환합니다.', () => {
    const testDate = new Date('2024-11-17');
    expect(getWeekday(testDate)).toBe('sun');
  });
  it('🔴 올바르지 않은 월의 날짜는 "none"을 반환합니다.', () => {
    const testDate = new Date('2024-13-17');
    expect(getWeekday(testDate)).toBe('none');
  });
  it('🔴 올바르지 않은 일의 날짜는 "none"을 반환합니다.', () => {
    const testDate = new Date('2024-12-35');
    expect(getWeekday(testDate)).toBe('none');
  });
});

describe('getRemainingDatesByWeek', () => {
  it('🟢 현재일자 2024-11-12이고 2024-11-21까지 매주 화요일 간격일 경우 2024-11-19 의 날짜를 가진 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-11-21');
    const interval = 1;
    const weekType = 'tue';
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(1);
    expect(result).toEqual([new Date('2024-11-19')]);
  });
  it('🟢 현재일자 2024-11-12이고 2024-12-31까지 매주 화요일 간격일 경우 7개의 의 날짜를 가진 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const weekType = 'tue';
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual(new Date('2024-11-19'));
    expect(result[1]).toEqual(new Date('2024-11-26'));
    expect(result[5]).toEqual(new Date('2024-12-24'));
    expect(result[6]).toEqual(new Date('2024-12-31'));
  });
  it('🔴 요일를 설정하지 않은 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-12');
    const interval = 1;
    const weekType = 'none';
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(0);
  });
  it('🔴 간격이 0인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-21');
    const interval = 0;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(0);
  });
  it('🔴 간격이 -1인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-12-21');
    const interval = -1;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(0);
  });
  it('🔴 간격을 입력하지 않은 경우 기본값은 1로 들어갑니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-11-21');
    const interval = undefined;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByWeek(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(1);
    expect(result).toEqual([new Date('2024-11-19')]);
  });
  it('🔴 종료일자가 시작일자보다 이전인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-11-12');
    const endDate = new Date('2024-01-21');
    expect(getRemainingDatesByWeek(currentDate, endDate)).toHaveLength(0);
  });
  it('🔴 현재일자의 월의 날짜가 올바르지 않은 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-31-12');
    const endDate = new Date('2024-12-21');
    expect(getRemainingDatesByWeek(currentDate, endDate)).toHaveLength(0);
  });
  it('🔴 현재일자의 일의 날짜가 올바르지 않은 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-01-39');
    const endDate = new Date('2024-12-21');
    expect(getRemainingDatesByWeek(currentDate, endDate)).toHaveLength(0);
  });
  it('🔴 종료일자의 월의 날짜가 올바르지 않은 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-01-01');
    const endDate = new Date('2024-92-21');
    expect(getRemainingDatesByWeek(currentDate, endDate)).toHaveLength(0);
  });
  it('🔴 종료일자의 일의 날짜가 올바르지 않은 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-81');
    expect(getRemainingDatesByWeek(currentDate, endDate)).toHaveLength(0);
  });
});

describe('isValidDate', () => {
  describe('🟢 유효한 날짜인 경우 true를 반환합니다.', () => {
    it('2024-11-14', () => {
      const testDate = new Date('2024-11-14');
      expect(isValidDate(testDate)).toBe(true);
    });
    it('2025-01-01', () => {
      const testDate = new Date('2025-01-01');
      expect(isValidDate(testDate)).toBe(true);
    });
  });
  describe('🔴 유효하지 않은 날짜의 경우 false를 반환합니다.', () => {
    it('2025-99-01', () => {
      const testDate = new Date('2025-99-01');
      expect(isValidDate(testDate)).toBe(false);
    });
    it('2025-10-33', () => {
      const testDate = new Date('2025-10-33');
      expect(isValidDate(testDate)).toBe(false);
    });
  });
});

describe('getNthWeekday', () => {
  it('🟢 2024년 1월의 2번째 수요일인 2024-01-10을 반환합니다.', () => {
    const testDate = new Date('2024-01-31');
    const testNth = 2;
    const weekType = 'wed';
    const result = getNthWeekday(testDate, testNth, weekType);
    expect(result?.getDay()).toBe(3);
    expect(result).toEqual(new Date('2024-01-10'));
  });
  it('🟢 2024년 3월의 4번째 월요일인 2024-03-25을 반환합니다.', () => {
    const testDate = new Date('2024-03-31');
    const testNth = 4;
    const weekType = 'mon';
    const result = getNthWeekday(testDate, testNth, weekType);
    expect(result?.getDay()).toBe(1);
    expect(result).toEqual(new Date('2024-03-25'));
  });
  it('🔴 3월의 5번째 월요일이 없을 시 null을 반환합니다.', () => {
    const testDate = new Date('2024-03-31');
    const testNth = 5;
    const weekType = 'mon';
    const result = getNthWeekday(testDate, testNth, weekType);
    expect(result).toBeNull();
  });
  it('🔴 nth가 0일 경우 null을 반환합니다.', () => {
    const testDate = new Date('2024-03-31');
    const testNth = 0;
    const weekType = 'mon';
    const result = getNthWeekday(testDate, testNth, weekType);
    expect(result).toBeNull();
  });
  it('🔴 nth가 음수일 경우 null을 반환합니다.', () => {
    const testDate = new Date('2024-03-31');
    const testNth = 0;
    const weekType = 'mon';
    const result = getNthWeekday(testDate, testNth, weekType);
    expect(result).toBeNull();
  });
});

describe('getRemainingDatesByMonth', () => {
  it('🟢 2024-08-13 부터 2024-12-31까지 1개월로 설정한 경우 9, 10, 11, 12월의 13일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-13');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(4);
    expect(result).toEqual([
      new Date('2024-09-13'),
      new Date('2024-10-13'),
      new Date('2024-11-13'),
      new Date('2024-12-13'),
    ]);
  });
  it('🟢 2024-08-13 부터 2024-12-31까지 2개월로 설정한 경우 10, 12월의 13일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-13');
    const endDate = new Date('2024-12-31');
    const interval = 2;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(2);
    expect(result).toEqual([new Date('2024-10-13'), new Date('2024-12-13')]);
  });
  it('🔴 2024-08-13 부터 2024-09-31까지 3개월로 설정한 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-13');
    const endDate = new Date('2024-09-31');
    const interval = 3;
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType);
    expect(result).toHaveLength(0);
  });
  it('🟢 2024-08-13 부터 2024-12-31까지 매월 31로 설정한 경우 8, 9, 10, 11, 12월의 말일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-13');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const weekType = getWeekday(currentDate);
    const day = 31;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      new Date('2024-08-31'),
      new Date('2024-09-30'),
      new Date('2024-10-31'),
      new Date('2024-11-30'),
      new Date('2024-12-31'),
    ]);
  });
  it('🟢 2024-01-13 부터 2024-05-31까지 매월 30로 설정한 경우 1, 3, 4, 5월의 30일의 날짜와 30일이 없는 월인 2월의 말일인 29일을 반환한다.', () => {
    const currentDate = new Date('2024-01-13');
    const endDate = new Date('2024-05-31');
    const interval = 1;
    const weekType = getWeekday(currentDate);
    const day = 30;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      new Date('2024-01-30'),
      new Date('2024-02-29'),
      new Date('2024-03-30'),
      new Date('2024-04-30'),
      new Date('2024-05-30'),
    ]);
  });
  it('🟢 2023-01-13 부터 2023-05-31까지 매월 30로 설정한 경우 1, 3, 4, 5월의 30일의 날짜와 30일이 없는 월인 2월의 말일인 28일일을 반환한다.', () => {
    const currentDate = new Date('2023-01-13');
    const endDate = new Date('2023-05-31');
    const interval = 1;
    const weekType = getWeekday(currentDate);
    const day = 30;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(5);
    expect(result).toEqual([
      new Date('2023-01-30'),
      new Date('2023-02-28'),
      new Date('2023-03-30'),
      new Date('2023-04-30'),
      new Date('2023-05-30'),
    ]);
  });
  it('🟢 2023-01-29 부터 2023-05-31까지 매월 27로 설정한 경우 2, 3, 4, 5월의 27일의 날짜를 가진 배열을 반환한다.', () => {
    const currentDate = new Date('2023-01-29');
    const endDate = new Date('2023-05-31');
    const interval = 1;
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(4);
    expect(result).toEqual([
      new Date('2023-02-27'),
      new Date('2023-03-27'),
      new Date('2023-04-27'),
      new Date('2023-05-27'),
    ]);
  });
  it('🟢 2023-01-29 부터 2023-05-31까지 2달마다 27로 설정한 경우 3, 5월의 27일의 날짜를 가진 배열을 반환한다.', () => {
    const currentDate = new Date('2023-01-29');
    const endDate = new Date('2023-05-31');
    const interval = 2;
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(2);
    expect(result).toEqual([new Date('2023-03-27'), new Date('2023-05-27')]);
  });
  it('🔴 2024-06-15 에 2024-07-01까지 매월 4일로 설정한 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-06-15');
    const endDate = new Date('2024-07-01');
    const interval = 1;
    const weekType = 'tue';
    const day = 4;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(0);
  });
  it('🔴 day가 0인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2023-01-29');
    const endDate = new Date('2023-05-31');
    const interval = 1;
    const weekType = 'tue';
    const day = 0;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(0);
  });
  it('🔴 day가 음수인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2023-01-29');
    const endDate = new Date('2023-05-31');
    const interval = 1;
    const weekType = 'tue';
    const day = -1;
    const result = getRemainingDatesByMonth(currentDate, endDate, interval, weekType, day);
    expect(result).toHaveLength(0);
  });
  it('🟢 2024-08-01 에 2024-12-31까지 매월 3주차 화요일로 설정한 경우 8, 9, 10, 11, 12월의 3주차 화요일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-01');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = 3;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(5);
    expect(result[0].getDay()).toBe(2);
    expect(result[1].getDay()).toBe(2);
    expect(result[2].getDay()).toBe(2);
    expect(result[3].getDay()).toBe(2);
    expect(result[4].getDay()).toBe(2);
    expect(result).toEqual([
      new Date('2024-08-20'),
      new Date('2024-09-17'),
      new Date('2024-10-15'),
      new Date('2024-11-19'),
      new Date('2024-12-17'),
    ]);
  });
  it('🟢 2024-08-29 에 2024-12-31까지 매월 3주차 화요일로 설정한 경우 9, 10, 11, 12월의 3주차 화요일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-29');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = 3;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(4);
    expect(result[0].getDay()).toBe(2);
    expect(result[1].getDay()).toBe(2);
    expect(result[2].getDay()).toBe(2);
    expect(result[3].getDay()).toBe(2);
    expect(result).toEqual([
      new Date('2024-09-17'),
      new Date('2024-10-15'),
      new Date('2024-11-19'),
      new Date('2024-12-17'),
    ]);
  });
  it('🟢 2024-08-01 에 2024-12-31까지 2달마다 3주차 화요일로 설정한 경우 8, 10, 12월의 3주차 화요일을 가진 날짜 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-01');
    const endDate = new Date('2024-12-31');
    const interval = 2;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = 3;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(3);
    expect(result[0].getDay()).toBe(2);
    expect(result[1].getDay()).toBe(2);
    expect(result[2].getDay()).toBe(2);
    expect(result).toEqual([
      new Date('2024-08-20'),
      new Date('2024-10-15'),
      new Date('2024-12-17'),
    ]);
  });
  it('🔴 2024-08-29 에 2024-09-08까지 매월 3주차 화요일로 설정한 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-29');
    const endDate = new Date('2024-09-08');
    const interval = 1;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = 3;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 weekOrder가 0인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-01');
    const endDate = new Date('2024-12-31');
    const interval = 2;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = 0;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 weekOrder가 음수인 경우 빈 배열을 반환합니다.', () => {
    const currentDate = new Date('2024-08-01');
    const endDate = new Date('2024-12-31');
    const interval = 2;
    const weekType = 'tue';
    const day = undefined;
    const weekOrder = -1;
    const result = getRemainingDatesByMonth(
      currentDate,
      endDate,
      interval,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
});

describe('getMonth', () => {
  it('🟢 1월은 "jan"을 반환합니다.', () => {
    const testDate = new Date('2024-01-19');
    expect(getMonth(testDate)).toBe('jan');
  });
  it('🟢 2월은 "feb"을 반환합니다.', () => {
    const testDate = new Date('2024-02-19');
    expect(getMonth(testDate)).toBe('feb');
  });
  it('🟢 3월은 "mar"을 반환합니다.', () => {
    const testDate = new Date('2024-03-19');
    expect(getMonth(testDate)).toBe('mar');
  });
  it('🟢 4월은 "apr"을 반환합니다.', () => {
    const testDate = new Date('2024-04-19');
    expect(getMonth(testDate)).toBe('apr');
  });
  it('🟢 5월은 "may"을 반환합니다.', () => {
    const testDate = new Date('2024-05-19');
    expect(getMonth(testDate)).toBe('may');
  });
  it('🟢 6월은 "jun"을 반환합니다.', () => {
    const testDate = new Date('2024-06-19');
    expect(getMonth(testDate)).toBe('jun');
  });
  it('🟢 7월은 "jul"을 반환합니다.', () => {
    const testDate = new Date('2024-07-19');
    expect(getMonth(testDate)).toBe('jul');
  });
  it('🟢 8월은 "aug"을 반환합니다.', () => {
    const testDate = new Date('2024-08-19');
    expect(getMonth(testDate)).toBe('aug');
  });
  it('🟢 9월은 "sep"을 반환합니다.', () => {
    const testDate = new Date('2024-09-19');
    expect(getMonth(testDate)).toBe('sep');
  });
  it('🟢 10월은 "oct"을 반환합니다.', () => {
    const testDate = new Date('2024-10-19');
    expect(getMonth(testDate)).toBe('oct');
  });
  it('🟢 11월은 "nov"을 반환합니다.', () => {
    const testDate = new Date('2024-11-19');
    expect(getMonth(testDate)).toBe('nov');
  });
  it('🟢 12월은 "dec"을 반환합니다.', () => {
    const testDate = new Date('2024-12-19');
    expect(getMonth(testDate)).toBe('dec');
  });
  it('🔴 올바르지 않은 월의 날짜는 "none"을 반환합니다.', () => {
    const testDate = new Date('2024-13-19');
    expect(getMonth(testDate)).toBe('none');
  });
  it('🔴 올바르지 않은 일의 날짜는 "none"을 반환합니다.', () => {
    const testDate = new Date('2024-12-39');
    expect(getMonth(testDate)).toBe('none');
  });
});

describe('getRemainingDatesByYear', () => {
  it('🟢 2024-11-13 에 2026-12-31까지 1년 주기를 설정할 경우 2025, 2026년의 11월 13일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2024-11-13');
    const endDate = new Date('2026-12-31');
    const interval = 1;
    const monthType = getMonth(currentDate);
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByYear(currentDate, endDate, interval, monthType, weekType);
    expect(result).toHaveLength(2);
    expect(result).toEqual([new Date('2025-11-13'), new Date('2026-11-13')]);
  });
  it('🟢 2024-11-13 에 2028-12-31까지 2년 주기를 설정할 경우 2026, 2028년의 11월 13일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2024-11-13');
    const endDate = new Date('2028-12-31');
    const interval = 2;
    const monthType = getMonth(currentDate);
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByYear(currentDate, endDate, interval, monthType, weekType);
    expect(result).toHaveLength(2);
    expect(result).toEqual([new Date('2026-11-13'), new Date('2028-11-13')]);
  });
  it('🔴 2024-11-13 에 2024-12-31까지 1년 주기를 설정할 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-11-13');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const monthType = getMonth(currentDate);
    const weekType = getWeekday(currentDate);
    const result = getRemainingDatesByYear(currentDate, endDate, interval, monthType, weekType);
    expect(result).toHaveLength(0);
  });
  it('🟢 2024-06-01 에 2026-12-31까지 매년 06-27을 설정할 경우 2024, 2025, 2026년의 06월 27일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2024-06-01');
    const endDate = new Date('2026-12-31');
    const interval = 1;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      new Date('2024-06-27'),
      new Date('2025-06-27'),
      new Date('2026-06-27'),
    ]);
  });
  it('🟢 2024-06-01 에 2030-12-31까지 3년마다 06-27을 설정할 경우 2024, 2027, 2030년의 06월 27일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2024-06-01');
    const endDate = new Date('2030-12-31');
    const interval = 3;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      new Date('2024-06-27'),
      new Date('2027-06-27'),
      new Date('2030-06-27'),
    ]);
  });
  it('🟢 2024-06-01 에 2024-12-31까지 매년 06-27을 설정할 경우 2024년의 06월 27일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2024-06-01');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(1);
    expect(result).toEqual([new Date('2024-06-27')]);
  });
  it('🔴 2024-07-01 에 2024-12-31까지 매년 06-27을 설정할 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-07-01');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = 27;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 day가 0일 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-06-01');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = 0;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 day가 음수일 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-06-01');
    const endDate = new Date('2024-12-31');
    const interval = 1;
    const monthType = 'jun';
    const weekType = getWeekday(currentDate);
    const day = -5;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day
    );
    expect(result).toHaveLength(0);
  });
  it('🟢 2023-06-01 에 2026-12-31까지 매년 11월를 둘째주 목요일을 설정할 경우 2023, 2024, 2025, 2026년의 11월 둘째주 목요일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2023-06-01');
    const endDate = new Date('2026-12-31');
    const interval = 1;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = 2;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(4);
    expect(result).toEqual([
      new Date('2023-11-09'),
      new Date('2024-11-14'),
      new Date('2025-11-13'),
      new Date('2026-11-12'),
    ]);
  });
  it('🟢 2023-06-01 에 2030-12-31까지 3년마다 11월를 둘째주 목요일을 설정할 경우 2023, 2026, 2029년의 11월 둘째주 목요일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2023-06-01');
    const endDate = new Date('2030-12-31');
    const interval = 3;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = 2;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      new Date('2023-11-09'),
      new Date('2026-11-12'),
      new Date('2029-11-08'),
    ]);
  });
  it('🟢 2023-12-01 에 2030-12-31까지 3년마다 11월를 둘째주 목요일을 설정할 경우 2026, 2029년의 11월 둘째주 목요일을 가진 배열을 반환한다', () => {
    const currentDate = new Date('2023-12-01');
    const endDate = new Date('2030-12-31');
    const interval = 3;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = 2;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(2);
    expect(result).toEqual([new Date('2026-11-12'), new Date('2029-11-08')]);
  });
  it('🔴 2024-12-01 에 2025-11-01까지 1년마다 11월를 둘째주 목요일을 설정할 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2024-12-01');
    const endDate = new Date('2025-11-01');
    const interval = 1;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = 2;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 weekOrder가 0일 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2023-12-01');
    const endDate = new Date('2030-12-31');
    const interval = 3;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = 0;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
  it('🔴 weekOrder가 음수일 경우 빈 배열을 반환한다', () => {
    const currentDate = new Date('2023-12-01');
    const endDate = new Date('2030-12-31');
    const interval = 3;
    const monthType = 'nov';
    const weekType = 'thu';
    const day = undefined;
    const weekOrder = -11;
    const result = getRemainingDatesByYear(
      currentDate,
      endDate,
      interval,
      monthType,
      weekType,
      day,
      weekOrder
    );
    expect(result).toHaveLength(0);
  });
});
