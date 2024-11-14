import {
  isLeapYear,
  isFebruary29,
  formatDateToString,
  findNextLeapYear,
  calculateDailyNext,
  calculateWeeklyNext,
  calculateMonthlyNext,
  calculateYearlyNext,
} from '@features/event/model/utils';

describe('isLeapYear', () => {
  it('4로 나누어떨어지고 100으로 나누어떨어지지 않는 연도는 윤년이다', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
  });

  it('100으로 나누어떨어지지만 400으로 나누어떨어지지 않는 연도는 윤년이 아니다', () => {
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
  });

  it('400으로 나누어떨어지는 연도는 윤년이다', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('그 외의 연도는 윤년이 아니다', () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
  });
});

describe('isFebruary29', () => {
  it('2월 29일인 경우 true를 반환한다', () => {
    const date = new Date('2024-02-29');
    expect(isFebruary29(date)).toBe(true);
  });

  it('2월 28일인 경우 false를 반환한다', () => {
    const date = new Date('2024-02-28');
    expect(isFebruary29(date)).toBe(false);
  });

  it('다른 달의 29일인 경우 false를 반환한다', () => {
    const date = new Date('2024-03-29');
    expect(isFebruary29(date)).toBe(false);
  });
});

describe('formatDateToString', () => {
  it('날짜를 YYYY-MM-DD 형식으로 변환한다', () => {
    const date = new Date('2024-02-29');
    expect(formatDateToString(date)).toBe('2024-02-29');
  });

  it('한 자릿수 월과 일을 두 자릿수로 변환한다', () => {
    const date = new Date('2024-01-05');
    expect(formatDateToString(date)).toBe('2024-01-05');
  });

  it('월과 일이 두 자릿수인 경우 그대로 유지한다', () => {
    const date = new Date('2024-12-31');
    expect(formatDateToString(date)).toBe('2024-12-31');
  });
});

describe('findNextLeapYear', () => {
  it('현재 연도부터 다음 윤년을 찾는다', () => {
    expect(findNextLeapYear(2023, 1)).toBe(2024);
  });

  it('주어진 간격으로 다음 윤년을 찾는다', () => {
    expect(findNextLeapYear(2024, 4)).toBe(2028);
  });

  it('간격이 큰 경우에도 다음 윤년을 찾는다', () => {
    expect(findNextLeapYear(2024, 2)).toBe(2028);
  });
});

describe('calculateDailyNext', () => {
  it('일간 반복에서 다음 날짜를 계산한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateDailyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2024-03-01');
  });

  it('월을 넘어가는 일간 반복을 처리한다', () => {
    const date = new Date('2024-03-31');
    const nextDate = calculateDailyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2024-04-01');
  });

  it('연도를 넘어가는 일간 반복을 처리한다', () => {
    const date = new Date('2024-12-31');
    const nextDate = calculateDailyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2025-01-01');
  });

  it('여러 일 간격의 반복을 처리한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateDailyNext(date, 5);
    expect(formatDateToString(nextDate)).toBe('2024-03-05');
  });
});

describe('calculateWeeklyNext', () => {
  it('주간 반복에서 다음 날짜를 계산한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateWeeklyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2024-03-07');
  });

  it('월을 넘어가는 주간 반복을 처리한다', () => {
    const date = new Date('2024-03-31');
    const nextDate = calculateWeeklyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2024-04-07');
  });

  it('연도를 넘어가는 주간 반복을 처리한다', () => {
    const date = new Date('2024-12-31');
    const nextDate = calculateWeeklyNext(date, 1);
    expect(formatDateToString(nextDate)).toBe('2025-01-07');
  });

  it('여러 주 간격의 반복을 처리한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateWeeklyNext(date, 2);
    expect(formatDateToString(nextDate)).toBe('2024-03-14');
  });
});

describe('calculateMonthlyNext', () => {
  it('월간 반복에서 다음 날짜를 계산한다', () => {
    const date = new Date('2024-01-15');
    const nextDate = calculateMonthlyNext(date, 1);
    expect(formatDateToString(nextDate!)).toBe('2024-02-15');
  });

  it('2월 29일인 경우 3월 29일을 반환한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateMonthlyNext(date, 1);
    expect(formatDateToString(nextDate!)).toBe('2024-03-29');
  });

  it('연도를 넘어가는 월간 반복을 처리한다', () => {
    const date = new Date('2024-12-15');
    const nextDate = calculateMonthlyNext(date, 1);
    expect(formatDateToString(nextDate!)).toBe('2025-01-15');
  });

  it('여러 달 간격의 반복을 처리한다', () => {
    const date = new Date('2024-01-15');
    const nextDate = calculateMonthlyNext(date, 3);
    expect(formatDateToString(nextDate!)).toBe('2024-04-15');
  });
});

describe('calculateYearlyNext', () => {
  it('연간 반복에서 다음 날짜를 계산한다', () => {
    const date = new Date('2024-01-15');
    const nextDate = calculateYearlyNext(date, 1);
    expect(formatDateToString(nextDate!)).toBe('2025-01-15');
  });

  it('2월 29일인 경우 다음 윤년의 2월 29일을 반환한다', () => {
    const date = new Date('2024-02-29');
    const nextDate = calculateYearlyNext(date, 1);
    expect(formatDateToString(nextDate!)).toBe('2028-02-29');
  });

  it('여러 해 간격의 반복을 처리한다', () => {
    const date = new Date('2024-01-15');
    const nextDate = calculateYearlyNext(date, 2);
    expect(formatDateToString(nextDate!)).toBe('2026-01-15');
  });
});
