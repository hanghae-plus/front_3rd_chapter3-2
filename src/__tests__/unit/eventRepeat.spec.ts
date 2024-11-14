import { EventForm, RepeatInfo } from '../../types';
import { createRepeatEvent } from '../../utils/eventRepeat';

const MOCK_EVENT: Omit<EventForm, 'repeat'> = {
  title: '새 회의',
  date: '2024-10-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '프로젝트 진행 상황 논의',
  location: '회의실 A',
  category: '업무',
  notificationTime: 10,
};

describe('getRepeatEvents', () => {
  it('2024년 10월 17일까지 하루 마다 반복된 3개의 이벤트들을 반환한다.', () => {
    const event: EventForm = {
      ...MOCK_EVENT,
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-10-17',
      },
    };

    const repeatEvents = createRepeatEvent(event);
    const isRightRepeatEvents = repeatEvents.every(({ repeat }) => repeat.endDate === '2024-10-17');

    expect(repeatEvents.length).toBe(3);
    expect(isRightRepeatEvents).toBe(true);
  });

  it('2024년 10월 31일까지 한 주 마다 반복된 3개의 이벤트들을 반환한다.', () => {
    const event: EventForm = {
      ...MOCK_EVENT,
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-10-31',
      },
    };

    const repeatEvents = createRepeatEvent(event);
    const isRightRepeatEvents = repeatEvents.every(({ repeat }) => repeat.endDate === '2024-10-29');

    expect(repeatEvents.length).toBe(3);
    expect(isRightRepeatEvents).toBe(true);
  });

  it('2024년 11월 15일까지 한 달 마다 반복된 2개의 이벤트들을 반환한다.', () => {
    const event: EventForm = {
      ...MOCK_EVENT,
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-11-15',
      },
    };

    const repeatEvents = createRepeatEvent(event);
    const isRightRepeatEvents = repeatEvents.every(({ repeat }) => repeat.endDate === '2024-11-14');

    expect(repeatEvents.length).toBe(2);
    expect(isRightRepeatEvents).toBe(true);
  });

  it('2026년 11월 15일까지 매 년 마다 반복된 2개의 이벤트들을 반환한다.', () => {
    const event: EventForm = {
      ...MOCK_EVENT,
      repeat: {
        type: 'yearly',
        interval: 2,
        endDate: '2026-11-15',
      },
    };

    const repeatEvents = createRepeatEvent(event);
    const isRightRepeatEvents = repeatEvents.every(({ repeat }) => repeat.endDate === '2026-10-15');

    expect(repeatEvents.length).toBe(2);
    expect(isRightRepeatEvents).toBe(true);
  });

  it('잘못된 반복 유형이 있으면 에러가 난다.', () => {
    const event: EventForm = {
      ...MOCK_EVENT,
      repeat: {
        type: 'etc' as RepeatInfo['type'], // 강제적 에러를 발생하기 위한 Type 처리
        interval: 1,
        endDate: '2024-10-15',
      },
    };

    expect(() => createRepeatEvent(event)).toThrow('잘못된 반복 유형입니다.');
  });
});
