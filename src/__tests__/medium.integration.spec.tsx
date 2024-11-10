import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { Provider } from 'jotai';

import { setupMockHandler } from '../__mocks__/handlersUtils';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App';
import { Event } from '../types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <Provider>
        <App />
      </Provider>
    </ChakraProvider>
  );
};

let user: UserEvent;
beforeEach(() => {
  user = userEvent.setup();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandler();
    renderApp();

    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    await user.type(screen.getByLabelText(/제목/), '팀 회의 제목');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:00');
    await user.type(screen.getByLabelText(/종료 시간/), '10:00');
    await user.type(screen.getByLabelText(/설명/), '팀 회의 설명');
    await user.type(screen.getByLabelText(/위치/), '회의실');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

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
        title: '수정될 이벤트',
        date: '2024-11-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandler(initEvents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('수정될 이벤트')).toBeInTheDocument();

    const editButton = await within(eventList).findByRole('button', { name: 'Edit event' });
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

    await user.click(screen.getByRole('button', { name: /일정 수정/ }));

    expect(within(eventList).getByText('수정된 팀 회의 제목')).toBeInTheDocument();
    expect(within(eventList).getByText('2024-11-06')).toBeInTheDocument();
    expect(within(eventList).getByText(/11:00/)).toBeInTheDocument();
    expect(within(eventList).getByText(/12:00/)).toBeInTheDocument();
    expect(within(eventList).getByText('수정된 팀 회의 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('수정된 회의실')).toBeInTheDocument();
    expect(within(eventList).getByText(/개인/)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const initEvents: Event[] = [
      {
        id: '1',
        title: '삭제될 이벤트',
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandler(initEvents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('삭제될 이벤트')).toBeInTheDocument();

    const deleteButton = await within(eventList).findAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButton[0]);

    expect(within(eventList).queryByText('삭제될 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.setSystemTime(new Date('2024-10-20'));
    setupMockHandler(events as Event[]);
    renderApp();

    await user.selectOptions(screen.getByLabelText(/view/), 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    renderApp();

    await user.selectOptions(screen.getByLabelText(/view/), 'week');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2024-10-01'));
    setupMockHandler(events as Event[]);
    renderApp();

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandler(events as Event[]);
    renderApp();

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    renderApp();

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const targetElement = screen.getByText('신정');
    expect(targetElement).toBeInTheDocument();
    expect(targetElement).toHaveStyle('color: red.500');
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandler(events as Event[]);
    renderApp();

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/검색어를 입력하세요/), '검색어');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const initEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-11-14',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandler(initEvents);
    renderApp();

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/검색어를 입력하세요/), '팀 회의');

    expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
    expect(within(eventList).queryByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandler(events as Event[]);
    renderApp();

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/검색어를 입력하세요/), '검색어');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/검색어를 입력하세요/));

    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
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
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandler(initEvents);
    renderApp();

    await user.type(screen.getByLabelText(/제목/), '충돌 이벤트');
    await user.type(screen.getByLabelText(/날짜/), '2024-11-03');
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');
    await user.type(screen.getByLabelText(/설명/), '충돌 이벤트 설명');
    await user.type(screen.getByLabelText(/위치/), '충돌 이벤트 위치');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
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
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
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
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    setupMockHandler(initEvents);
    renderApp();

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('충돌 이벤트')).toBeInTheDocument();

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), '09:30');
    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText(/종료 시간/), '10:30');

    await user.click(screen.getByRole('button', { name: /일정 수정/ }));

    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2024-11-03T08:50:00'));

  const initEvents: Event[] = [
    {
      id: '1',
      title: '알람 이벤트',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '알람 이벤트 설명',
      location: '알람 이벤트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandler(initEvents);
  renderApp();

  await vi.advanceTimersByTimeAsync(1000); // 1초만 진행

  expect(screen.getAllByText('10분 후 알람 이벤트 일정이 시작됩니다.')[0]).toBeInTheDocument();
});
