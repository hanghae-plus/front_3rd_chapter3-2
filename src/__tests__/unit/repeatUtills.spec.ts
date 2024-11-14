import { describe, it, expect } from 'vitest';
import { getEventsRepeats } from '../../utils/repeatUtils';
import { Event } from '../../types';

describe('getEventsRepeats', () => {
  const baseEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2024-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: 'A test event',
    location: 'Test Location',
    category: 'Test',
    notificationTime: 30,
    repeat: { type: 'none', interval: 1 }
  };

  it('지정된 날짜에 발생한 이벤트를 반복 없이 반환해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, date: '2024-11-01', repeat: { type: 'none', interval: 1 } },
      { ...baseEvent, date: '2024-11-02', repeat: { type: 'none', interval: 1 } }
    ];
    const result = getEventsRepeats(events, new Date('2024-11-01').getTime());
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-11-01');
  });

  it('지정된 날짜에 일일 반복 이벤트를 반환해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, repeat: { type: 'daily', interval: 1 } },
      { ...baseEvent, repeat: { type: 'daily', interval: 2 } }
    ];
    const result = getEventsRepeats(events, new Date('2024-11-02').getTime());
    expect(result).toHaveLength(1);
  });

  it('간격과 일치하는 주간 반복 이벤트를 반환해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, date: '2024-11-01', repeat: { type: 'weekly', interval: 1 } }
    ];
    const result = getEventsRepeats(events, new Date('2024-11-08').getTime());
    expect(result).toHaveLength(1);
  });

  it('매월 같은 날에 매월 반복되는 이벤트를 반환해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, date: '2024-11-01', repeat: { type: 'monthly', interval: 1 } }
    ];
    const result = getEventsRepeats(events, new Date('2024-12-01').getTime());
    expect(result).toHaveLength(1);
  });

  it('endDate를 기준으로 종료된 이벤트는 제외해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, repeat: { type: 'daily', interval: 1, endDate: '2024-11-03' } }
    ];
    const result = getEventsRepeats(events, new Date('2024-11-04').getTime());
    expect(result).toHaveLength(0);
  });

  it('시작 날짜 이전에 이벤트를 제외해야 합니다', () => {
    const events: Event[] = [
      { ...baseEvent, date: '2024-11-05', repeat: { type: 'daily', interval: 1 } }
    ];
    const result = getEventsRepeats(events, new Date('2024-11-04').getTime());
    expect(result).toHaveLength(0);
  });
});
