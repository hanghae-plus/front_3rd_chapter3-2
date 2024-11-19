import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { AddOrEdit } from '../../feature/addOrEdit';
import { Calendar } from '../../feature/calendar';
import { SearchCalendar } from '../../feature/searchCalendar';
import { CombinedContextProvider } from '../../provider';

let user: UserEvent;

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

describe('캘린더 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-10-01');
    user = userEvent.setup();
    render(
      <CombinedContextProvider>
        <ChakraProvider>
          <Calendar />
        </ChakraProvider>
      </CombinedContextProvider>
    );
  });

  it('컴포넌트가 정상적으로 렌더링 된다.', () => {
    expect(screen.getByText('일정 보기')).toBeInTheDocument();
  });

  it('월 뷰 버튼을 누르면 월 뷰가 나타난다.', async () => {
    const nextButton = screen.getByLabelText('Next');
    const prevButton = screen.getByLabelText('Previous');

    await user.click(nextButton);

    expect(screen.getByText('2024년 11월')).toBeInTheDocument();

    await user.click(prevButton);

    expect(screen.getByText('2024년 10월')).toBeInTheDocument();
  });

  it('해당 월의 공휴일이 표시된다.', async () => {
    expect(screen.getByText('한글날')).toBeInTheDocument();
    expect(screen.getByText('개천절')).toBeInTheDocument();
  });

  it('캘린더의 view 기준을 월에서 주로 변경한다.', async () => {
    const targetSelect = screen.getByLabelText('view');

    expect(targetSelect).toHaveValue('month');

    await user.selectOptions(targetSelect, 'week');

    expect(targetSelect).toHaveValue('week');
    expect(screen.getByText('2024년 10월 1주')).toBeInTheDocument();
  });
});

describe('이벤트 추가/수정 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-10-01');
    user = userEvent.setup();

    render(
      <CombinedContextProvider>
        <ChakraProvider>
          <AddOrEdit />
          <SearchCalendar />
        </ChakraProvider>
      </CombinedContextProvider>
    );
  });

  it('캘린더 헤더 컴포넌트가 정상적으로 렌더링 된다.', async () => {
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('일정 추가');
    });
  });

  it('이벤트가 정상적으로 추가 된다.', async () => {
    const newEvent = {
      title: '오늘도 열심히 회의',
      date: '2024-10-04',
      startTime: '09:00',
      endTime: '10:00',
      description: '중간점검',
      location: '회의실',
      category: '업무',
    };

    await user.type(screen.getByLabelText(/제목/), newEvent.title);
    await user.type(screen.getByLabelText(/날짜/), newEvent.date);
    await user.type(screen.getByLabelText(/시작 시간/), newEvent.startTime);
    await user.type(screen.getByLabelText(/종료 시간/), newEvent.endTime);
    await user.type(screen.getByLabelText(/설명/), newEvent.description);
    await user.type(screen.getByLabelText(/위치/), newEvent.location);
    await user.selectOptions(screen.getByLabelText(/카테고리/), newEvent.category);

    const addEventButton = screen.getByRole('button', { name: /일정 추가/ });

    await user.click(addEventButton);

    expect(toastFn).toHaveBeenCalledWith({
      duration: 3000,
      isClosable: true,
      status: 'success',
      title: '일정이 추가되었습니다.',
    });
  });

  it('이벤트가 정상적으로 수정 된다.', async () => {
    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith({
        title: '일정 로딩 완료!',
        status: 'info',
        duration: 1000,
      });
    });

    const eventList = await screen.findByTestId('event-list');

    const editEventButton = within(eventList).getAllByLabelText('Edit event')[0];

    await user.click(editEventButton);

    const editEvent = {
      title: '오늘도 열심히 회의 수정 했어요!',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '중간점검 수정 했어요!',
      location: '회의실은 그대로지롱',
      category: '업무',
    };

    await user.clear(screen.getByLabelText(/제목/));
    await user.type(screen.getByLabelText(/제목/), editEvent.title);

    await user.clear(screen.getByLabelText(/날짜/));
    await user.type(screen.getByLabelText(/날짜/), editEvent.date);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), editEvent.startTime);

    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText(/종료 시간/), editEvent.endTime);

    await user.clear(screen.getByLabelText(/설명/));
    await user.type(screen.getByLabelText(/설명/), editEvent.description);

    await user.clear(screen.getByLabelText(/위치/));
    await user.type(screen.getByLabelText(/위치/), editEvent.location);

    await user.selectOptions(screen.getByLabelText(/카테고리/), editEvent.category);

    const applyEditButton = screen.getByRole('button', { name: /일정 수정/ });

    await user.click(applyEditButton);

    expect(toastFn).toHaveBeenCalledWith({
      duration: 3000,
      isClosable: true,
      status: 'success',
      title: '일정이 수정되었습니다.',
    });
  });
});

describe('이벤트 검색 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-10-01');
    user = userEvent.setup();
    render(
      <CombinedContextProvider>
        <ChakraProvider>
          <AddOrEdit />
          <SearchCalendar />
        </ChakraProvider>
      </CombinedContextProvider>
    );
  });

  it('이벤트가 정상적으로 렌더링 된다.', async () => {
    const eventList = await screen.findByTestId('event-list');
    expect(eventList).toHaveTextContent('기존 회의');
  });

  it('검색된 이벤트가 없으면 검색 결과가 없다는 문구가 나타난다.', async () => {
    const searchInput = screen.getByLabelText(/검색/);
    await user.type(searchInput, '없음');

    const eventList = await screen.findByTestId('event-list');

    expect(eventList).toHaveTextContent('검색 결과가 없습니다.');
  });
});
