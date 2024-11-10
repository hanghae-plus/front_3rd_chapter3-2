import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-11-02',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2024-11-02');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-11-02',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-09',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 3입니다.',
        location: '서울',
        category: '카테고리 3',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '';
    const currentDate = new Date('2024-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-09',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 3입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '';
    const currentDate = new Date('2024-07-01');
    const view = 'month';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-09',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 3입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '검색어 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '검색어 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-09',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 3입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '이벤트';
    const currentDate = new Date('2024-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '검색어 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '검색어 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '검색어 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '';
    const currentDate = new Date('2024-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '검색어 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '검색어 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: 'search 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'SEARCH 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = 'Search';
    const currentDate = new Date('2024-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: 'search 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 1입니다.',
        location: '이벤트',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: 'SEARCH 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '검색어 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it.each([
    { desc: '전월 달', date: '2024-07-01' },
    { desc: '다음 달', date: '2024-06-30' },
  ])('주간 뷰에서 $desc의 이벤트가 현재 날짜와 같은 주에 있는 경우 함께 필터링된다', ({ date }) => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2024-07-09',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 3입니다.',
        location: '서울',
        category: '카테고리 3',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const searchTerm = '';
    const currentDate = new Date(date);
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2024-06-30',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 1입니다.',
        location: '서울',
        category: '카테고리 1',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '이벤트 2입니다.',
        location: '서울',
        category: '카테고리 2',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const searchTerm = '';
    const currentDate = new Date('2024-07-01');
    const view = 'week';

    const filteredEvents = getFilteredEvents(events, searchTerm, currentDate, view);

    expect(filteredEvents).toHaveLength(0);
  });
});
