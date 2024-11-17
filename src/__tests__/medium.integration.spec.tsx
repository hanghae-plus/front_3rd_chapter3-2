import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { afterEach, expect, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils.ts';
import App from '../App';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const original = await vi.importActual('@chakra-ui/react');
  return {
    ...original,
    useToast: () => mockToast,
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
  vi.setSystemTime('2024-11-01');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 저장된다.', async () => {
    setupMockHandlerCreation();
    renderApp();

    await user.type(screen.getByLabelText(/제목/), '이벤트');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:00');
    await user.type(screen.getByLabelText(/종료 시간/), '10:00');
    await user.type(screen.getByLabelText(/설명/), '컨벤션 설정');
    await user.type(screen.getByLabelText(/위치/), '회의실');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '이벤트');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트')).toBeInTheDocument();
      expect(within(eventList).getByText('2024-11-03')).toBeInTheDocument();
      expect(within(eventList).getByText(/09:00/)).toBeInTheDocument();
      expect(within(eventList).getByText(/10:00/)).toBeInTheDocument();
      expect(within(eventList).getByText('컨벤션 설정')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실')).toBeInTheDocument();
      expect(within(eventList).getByText(/업무/)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 일정 수정 버튼을 누르면 변경사항이 반영된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 미팅',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '컨벤션 설정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
    ]);
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '팀 미팅',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '컨벤션 설정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
    ]);

    renderApp();

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
    await user.clear(searchInput);
    await user.type(searchInput, '팀 미팅');

    await waitFor(() => {
      expect(within(eventList).getByText('팀 미팅')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Edit event/i });
    await user.click(editButton);

    await user.clear(screen.getByLabelText(/제목/));
    await user.type(screen.getByLabelText(/제목/), '수정된 팀 미팅');
    await user.clear(screen.getByLabelText(/설명/));
    await user.type(screen.getByLabelText(/설명/), '수정된 설명');

    await user.click(screen.getByRole('button', { name: /일정 수정/ }));

    await user.clear(searchInput);
    await user.type(searchInput, '수정된 팀 미팅');

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 팀 미팅')).toBeInTheDocument();
      expect(within(eventList).getByText('수정된 설명')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 검색어를 입력해도 검색결과에 표출되지 않는다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '컨벤션 설정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
    setupMockHandlerDeletion([
      {
        id: '1',
        title: '이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '컨벤션 설정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
    renderApp();

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '이벤트');

    await waitFor(() => {
      expect(within(eventList).getByText('이벤트')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete event');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('이벤트')).not.toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    renderApp();

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '없는 일정');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의입니다',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);
    renderApp();

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 회의입니다',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '개인 일정',
        date: '2024-11-04',
        startTime: '11:00',
        endTime: '12:00',
        description: '개인적인 일정',
        location: '사무실',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    renderApp();

    const searchInput = screen.getByLabelText(/일정 검색/);
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();

    await user.clear(searchInput);

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('개인 일정')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고 문구(다음 일정과 겹칩니다)가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '첫 번째 일정',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);

    renderApp();

    await user.type(screen.getByLabelText(/제목/), '두 번째 일정');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');
    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다:/i)).toBeInTheDocument();
      expect(screen.getByText('첫 번째 일정 (2024-11-03 09:00-10:00)')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고 메세지(다음 일정과 겹칩니다)가 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '첫 번째 일정',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '두번째 일정',
        date: '2024-11-03',
        startTime: '10:30',
        endTime: '11:00',
        description: '첫 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ]);

    renderApp();

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('첫 번째 일정')).toBeInTheDocument();
      expect(within(eventList).getByText('두번째 일정')).toBeInTheDocument();
    });

    const editButton = screen.queryAllByLabelText('Edit event');
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), '10:30');
    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText(/종료 시간/), '11:30');
    await user.click(screen.getByRole('button', { name: /일정 수정/ }));

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다:/i)).toBeInTheDocument();
      expect(screen.getByText('두번째 일정 (2024-11-03 10:30-11:00)')).toBeInTheDocument();
    });
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2024-07-02T09:50:00'));

    setupMockHandlerCreation([
      {
        id: '1',
        title: '스크럼',
        date: '2024-07-02',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '회의실 1',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/시작됩니다/i)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
