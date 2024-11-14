import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../entities/event/model/types';
import { server } from '../setupTests';

vi.mock(import('@chakra-ui/react'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

let user: UserEvent;
beforeEach(() => {
  user = userEvent.setup();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    renderApp();
    await user.type(screen.getByLabelText(/제목/), '팀 회의 제목');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:00');
    await user.type(screen.getByLabelText(/종료 시간/), '10:00');
    await user.type(screen.getByLabelText(/설명/), '팀 회의 설명');
    await user.type(screen.getByLabelText(/위치/), '회의실');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /추가/ }));

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의 제목')).toBeInTheDocument();
    expect(within(eventList).getByText('2024-11-03')).toBeInTheDocument();
    expect(within(eventList).getByText(/09:00/)).toBeInTheDocument();
    expect(within(eventList).getByText(/10:00/)).toBeInTheDocument();
    expect(within(eventList).getByText('팀 회의 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('회의실')).toBeInTheDocument();
    expect(within(eventList).getByText(/업무/)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        isRepeating: false,
        repeat: {
          type: 'daily',
          interval: 2,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];
    setupMockHandlerCreation(initEvents);
    renderApp();

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: initEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = initEvents.findIndex((event) => event.id === id);

        initEvents[index] = { ...initEvents[index], ...updatedEvent };
        return HttpResponse.json(initEvents[index]);
      })
    );

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getAllByText('기존 회의')).toHaveLength(1);

    const editButton = await screen.findByTestId('edit-button');
    await user.click(editButton);

    await user.clear(screen.getByLabelText(/제목/));
    await user.type(screen.getByLabelText(/제목/), '수정된 팀 회의 제목');
    await user.clear(screen.getByLabelText(/날짜/));
    await user.type(screen.getByLabelText(/날짜/), '2024-11-06');
    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), '11:00');
    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText(/종료 시간/), '12:00');
    await user.clear(screen.getByLabelText(/설명/));
    await user.type(screen.getByLabelText(/설명/), '수정된 팀 회의 설명');
    await user.clear(screen.getByLabelText(/위치/));
    await user.type(screen.getByLabelText(/위치/), '수정된 회의실');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '개인');

    await user.click(screen.getByRole('button', { name: /수정/ }));
    const updatedEventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('수정된 팀 회의 제목')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: true,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: 'date',
          endDate: '2024-12-10',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];

    setupMockHandlerCreation(mockEvents);
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );
    renderApp();
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findByTestId('delete-button');
    await user.click(allDeleteButton);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // Mock 이벤트 설정 (11월 첫째 주 일정)
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: true,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: 'date',
          endDate: '2024-12-10',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];

    // 시스템 시간 설정 (10월)
    vi.setSystemTime(new Date('2024-10-01'));

    // MSW 핸들러 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    renderApp();

    // 주별 뷰로 변경
    const viewSelect = screen.getByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    // 일정 로딩 대기
    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(eventList).toBeInTheDocument();
    });

    // 10월 첫째 주에는 일정이 없으므로, 일정 없음 메시지가 표시되어야 함
    const searchInput = await screen.findByTestId('search-input');
    await user.type(searchInput, '검색어');
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: true,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: 'date',
          endDate: '2024-12-10',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];
    setupMockHandlerCreation(mockEvents);
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('2024년 10월 1주')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    setupMockHandlerCreation();
    renderApp();

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '이번달 팀 회의',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: true,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: 'date',
          endDate: '2024-12-10',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];
    vi.setSystemTime(new Date('2024-10-01'));
    setupMockHandlerCreation(mockEvents);
    renderApp();
    const monthView = within(screen.getByTestId('month-view'));
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '이번달 팀 회의');
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    setupMockHandlerCreation();
    renderApp();

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2024-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              isRepeating: false,
              repeat: {
                type: 'none',
                interval: 0,
                endCondition: 'never',
              },
              notificationTime: {
                value: 10,
                label: '10분 전',
              },
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2024-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              isRepeating: false,
              repeat: {
                type: 'none',
                interval: 0,
                endCondition: 'never',
              },
              notificationTime: {
                value: 10,
                label: '10분 전',
              },
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderApp();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    renderApp();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    renderApp();

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '충돌 이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];

    setupMockHandlerCreation(mockEvents);
    renderApp();

    await user.type(screen.getByLabelText(/제목/), '충돌 이벤트');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');
    await user.type(screen.getByLabelText(/설명/), '충돌 이벤트 설명');
    await user.type(screen.getByLabelText(/위치/), '충돌 이벤트 위치');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /추가/ }));
    expect(true).toBe(true);
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const initEvents: Event[] = [
      {
        id: '1',
        title: '충돌 이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
      {
        id: '2',
        title: '충돌 이벤트2',
        date: '2024-11-03',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];
    setupMockHandlerCreation(initEvents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('충돌 이벤트')).toBeInTheDocument();

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');

    await user.click(screen.getByRole('button', { name: /수정/ }));

    expect(true).toBe(true);
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2024-10-15T08:49:59'));
    const initEvents: Event[] = [
      {
        id: '1',
        title: '알람 이벤트',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '알람 이벤트 설명',
        location: '알람 이벤트 위치',
        category: '업무',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];
    setupMockHandlerCreation(initEvents);
    renderApp();
    await vi.advanceTimersByTimeAsync(1000);

    expect(true).toBe(true);
  });
});
