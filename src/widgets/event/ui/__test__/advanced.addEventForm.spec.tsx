import { ChakraProvider } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AddEventForm } from '../AddEventForm';

// 모킹된 값을 제어하기 위한 변수
let mockEditingEvent: Event | null = null;

vi.mock('@features/event/model/stores', () => ({
  useEventFormStore: () => ({
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    editingEvent: mockEditingEvent,
  }),
}));

vi.mock('@features/event/ui', () => ({
  SelectScheduleField: () => <div data-testid="schedule-field">Schedule Field</div>,
  AddOrUpdateButton: () => <button data-testid="save-button">저장</button>,
  RepeatForm: () => <div data-testid="repeat-form">Repeat Form</div>,
}));

describe('AddEventForm', () => {
  const mockEvents: Event[] = [];
  const mockSaveEvent = vi.fn();

  const defaultProps = {
    events: mockEvents,
    saveEvent: mockSaveEvent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditingEvent = null; // 각 테스트 전에 초기화
  });

  it('컴포넌트가 정상적으로 렌더링됨', () => {
    render(
      <ChakraProvider>
        <AddEventForm {...defaultProps} />
      </ChakraProvider>
    );

    expect(screen.getByText('일정 추가')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('반복 일정')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('모든 카테고리 옵션이 렌더링됨', () => {
    render(
      <ChakraProvider>
        <AddEventForm {...defaultProps} />
      </ChakraProvider>
    );

    const categorySelect = screen.getByLabelText('카테고리');
    expect(categorySelect).toBeInTheDocument();

    const options = ['업무', '개인', '가족', '기타'];
    options.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('알림 설정 옵션이 올바르게 렌더링됨', () => {
    render(
      <ChakraProvider>
        <AddEventForm {...defaultProps} />
      </ChakraProvider>
    );

    const notificationSelect = screen.getByLabelText('알림 설정');
    expect(notificationSelect).toBeInTheDocument();

    expect(screen.getByText('1분 전')).toBeInTheDocument();
    expect(screen.getByText('10분 전')).toBeInTheDocument();
    expect(screen.getByText('1시간 전')).toBeInTheDocument();
  });

  it('편집 모드일 때 제목이 변경됨', () => {
    // 모킹된 값 설정
    mockEditingEvent = { id: '1', title: '테스트 이벤트' } as Event;

    render(
      <ChakraProvider>
        <AddEventForm {...defaultProps} />
      </ChakraProvider>
    );

    expect(screen.getByText('일정 수정')).toBeInTheDocument();
  });
});
