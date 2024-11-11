import { ChakraProvider } from '@chakra-ui/react';
import { type Event } from '@entities/event/model/types';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EventView } from '../EventView';

vi.mock('@features/event/model/stores', () => ({
  useEventFormStore: () => ({
    editEvent: vi.fn(),
  }),
}));

vi.mock('@features/event/ui', () => ({
  EventList: ({ filteredEvents }: { filteredEvents: Event[] }) => (
    <div data-testid="event-list-mock">
      {filteredEvents.map((event) => (
        <div key={event.id} data-testid="event-item">
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

describe('EventView', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2024-11-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 런치',
      location: '레스토랑',
      category: '개인',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    },
  ];

  const defaultProps = {
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    searchTerm: '',
    setSearchTerm: vi.fn(),
    deleteEvent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컴포넌트가 정상적으로 렌더링됨', () => {
    render(
      <ChakraProvider>
        <EventView {...defaultProps} />
      </ChakraProvider>
    );

    expect(screen.getByTestId('event-list')).toBeInTheDocument();
    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
  });

  it('검색어 입력이 정상적으로 동작함', () => {
    const mockSetSearchTerm = vi.fn();

    render(
      <ChakraProvider>
        <EventView {...defaultProps} setSearchTerm={mockSetSearchTerm} />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '미팅' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('미팅');
  });

  it('검색어가 있을 때 input value가 정상적으로 표시됨', () => {
    render(
      <ChakraProvider>
        <EventView {...defaultProps} searchTerm="미팅" />
      </ChakraProvider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요') as HTMLInputElement;
    expect(searchInput.value).toBe('미팅');
  });

  it('EventList에 올바른 props가 전달됨', () => {
    render(
      <ChakraProvider>
        <EventView {...defaultProps} />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list-mock');
    expect(eventList).toBeInTheDocument();

    const eventItems = screen.getAllByTestId('event-item');
    expect(eventItems).toHaveLength(2);
    expect(eventItems[0]).toHaveTextContent('팀 미팅');
    expect(eventItems[1]).toHaveTextContent('점심 약속');
  });

  it('스크롤이 가능한 컨테이너로 렌더링됨', () => {
    render(
      <ChakraProvider>
        <EventView {...defaultProps} />
      </ChakraProvider>
    );

    const container = screen.getByTestId('event-list');
    expect(container).toHaveStyle({ overflowY: 'auto' });
  });
});
