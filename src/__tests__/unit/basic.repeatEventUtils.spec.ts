import { EventForm, RepeatType } from '../../types';
import { generateRepeatingEvents } from '../../utils/repeatEventUtils';

describe('generateRepeatingEvents', () => {
  const baseEvent: EventForm = {
    title: '테스트 이벤트',
    date: '2023-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    notificationTime: 0,
    repeat: {
      type: 'daily' as RepeatType,
      interval: 1,
      endDate: '2023-01-05',
    },
  };

  it('일일 반복 이벤트를 생성한다', () => {
    const events = generateRepeatingEvents(baseEvent);
    expect(events.length).toBe(5);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[4].date).toBe('2023-01-05');
  });

  it('주간 반복 이벤트를 생성한다', () => {
    const weeklyEvent: EventForm = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        type: 'weekly' as RepeatType,
        interval: 1,
        endDate: '2023-01-29',
      },
    };
    const events = generateRepeatingEvents(weeklyEvent);
    expect(events.length).toBe(5);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[4].date).toBe('2023-01-29');
  });

  it('월간 반복 이벤트를 생성한다', () => {
    const monthlyEvent: EventForm = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        type: 'monthly' as RepeatType, // 여기도 'as RepeatType'를 추가
        interval: 1,
        endDate: '2023-05-01',
      },
    };
    const events = generateRepeatingEvents(monthlyEvent);
    expect(events.length).toBe(5);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[4].date).toBe('2023-05-01');
  });

  it('연간 반복 이벤트를 생성한다', () => {
    const yearlyEvent: EventForm = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        type: 'yearly' as RepeatType,
        interval: 1,
        endDate: '2027-01-01',
      },
    };
    const events = generateRepeatingEvents(yearlyEvent);
    expect(events.length).toBe(5);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[4].date).toBe('2027-01-01');
  });

  it('반복 종료일이 없는 경우 1년 후까지 이벤트를 생성한다', () => {
    const noEndDateEvent: EventForm = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: undefined,
      },
    };
    const events = generateRepeatingEvents(noEndDateEvent);
    expect(events.length).toBe(365);
    expect(events[0].date).toBe('2023-01-01');
    expect(events[events.length - 1].date).toBe('2023-12-31');
  });

  it('잘못된 반복 설정으로 에러를 발생시킨다', () => {
    const invalidEvent: EventForm = {
      ...baseEvent,
      repeat: {
        type: 'none' as RepeatType,
        interval: 1,
        endDate: undefined,
      },
    };
    expect(() => generateRepeatingEvents(invalidEvent)).toThrow('Invalid repeat configuration');
  });
});
