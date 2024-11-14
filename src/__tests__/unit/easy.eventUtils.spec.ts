import { Event } from '../../types';

import { createEventRepeatFormData, getFilteredEvents } from '@/features/event/lib/eventUtils';

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: '2024-07-01',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
    description: 'Event 1 description',
    location: 'Event 1 location',
    category: 'Event 1 category',
    repeat: {
      type: 'daily',
      interval: 1,
    },
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-11-01',
    startTime: '12:00',
    endTime: '13:00',
    notificationTime: 10,
    description: '이벤트 2 설명',
    location: '이벤트 2 장소',
    category: '이벤트 2 카테고리',
    repeat: {
      type: 'daily',
      interval: 1,
    },
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2024-11-01'), 'week');
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toHaveLength(1);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(filteredEvents).toHaveLength(1);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2024-11-01'), 'week');
    expect(filteredEvents).toHaveLength(1);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(filteredEvents).toHaveLength(1);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'event 1', new Date('2024-07-01'), 'week');
    expect(filteredEvents).toHaveLength(1);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const newEvents: Event[] = [
      {
        id: '40',
        title: 'Event 100',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '11:00',
        notificationTime: 10,
        description: 'Event 1 description',
        location: 'Event 1 location',
        category: 'Event 1 category',
        repeat: {
          type: 'daily',
          interval: 1,
        },
      },
      ...events,
      {
        id: '41',
        title: '이벤트 200',
        date: '2024-08-01',
        startTime: '12:00',
        endTime: '13:00',
        notificationTime: 10,
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
        category: '이벤트 2 카테고리',
        repeat: {
          type: 'daily',
          interval: 1,
        },
      },
    ];

    const filteredEvents = getFilteredEvents(newEvents, '', new Date('2024-07-01'), 'month');
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents[0].title).toBe('Event 1');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2024-11-01'), 'month');
    expect(filteredEvents).toHaveLength(0);
  });
});

describe('createEventRepeatFormData', () => {
  it('isRepeating이 true일 때 기본값은 daily이다', () => {
    const repeatState = createEventRepeatFormData({
      isRepeating: true,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
    });
    expect(repeatState.type).toBe('daily');
  });
  it('isRepeating이 false일 때 repeatType은 none이다', () => {
    const repeatState = createEventRepeatFormData({
      isRepeating: false,
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '',
    });
    expect(repeatState.type).toBe('none');
  });
});
