import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

import { setupMockHandler } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { EventManageForm } from '../../components/eventManageView/EventManageForm';
import { Event } from '../../types';

interface ProviderProps {
  initialValues: [atom: any, value: any][];
  children: React.ReactNode;
}

const HydrateAtoms = ({ initialValues, children }: ProviderProps) => {
  useHydrateAtoms(initialValues);
  return children;
};

const TestProvider = ({ initialValues, children }: ProviderProps) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
);

const renderEventManageForm = (initialValues?: [atom: any, value: any][]) => {
  if (initialValues) {
    return render(
      <ChakraProvider>
        <TestProvider initialValues={initialValues}>
          <EventManageForm />
        </TestProvider>
      </ChakraProvider>
    );
  } else {
    return render(
      <ChakraProvider>
        <Provider>
          <EventManageForm />
        </Provider>
      </ChakraProvider>
    );
  }
};

const renderApp = () => {
  return render(
    <ChakraProvider>
      <Provider>
        <App />
      </Provider>
    </ChakraProvider>
  );
};

describe('반복 설정 토글 옵션', () => {
  it('반복 일정 미설정 시 반복 유형 옵션이 뜨지 않는다.', async () => {
    renderEventManageForm();

    const repeatTypeSelect = screen.queryByLabelText(/반복 유형/);
    const repeatInterval = screen.queryByLabelText(/반복 간격/);
    const repeatEnd = screen.queryByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).not.toBeInTheDocument();
    expect(repeatInterval).not.toBeInTheDocument();
    expect(repeatEnd).not.toBeInTheDocument();
  });

  it('반복 일정 설정 시 반복 유형 옵션이 뜬다.', async () => {
    renderEventManageForm();

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/ });
    await userEvent.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText(/반복 유형/);
    const repeatInterval = screen.getByLabelText(/반복 간격/);
    const repeatEnd = screen.getByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).toBeInTheDocument();
    expect(repeatInterval).toBeInTheDocument();
    expect(repeatEnd).toBeInTheDocument();
  });
});

it('반복 종료일이 날짜보다 이전인 경우 반복 종료일을 날짜 이후로 설정해주세요 문구가 뜬다', async () => {
  renderEventManageForm();

  await userEvent.type(screen.getByLabelText(/제목/), '팀 회의 제목');
  await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-03');
  await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
  await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
  await userEvent.type(screen.getByLabelText(/설명/), '팀 회의 설명');
  await userEvent.type(screen.getByLabelText(/위치/), '회의실');
  await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

  await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));
  await userEvent.type(screen.getByLabelText(/반복 종료일/), '2024-11-01');

  await userEvent.click(screen.getByRole('button', { name: /일정 추가/ }));

  expect(await screen.findByText('반복 종료일을 날짜 이후로 설정해주세요.')).toBeInTheDocument();
});

it('반복 간격을 0으로 작성 후 일정 추가 시 반복 간격을 1 이상의 숫자로 입력해주세요 문구가 뜬다', async () => {
  renderEventManageForm();

  await userEvent.type(screen.getByLabelText(/제목/), '팀 회의 제목');
  await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-03');
  await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
  await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
  await userEvent.type(screen.getByLabelText(/설명/), '팀 회의 설명');
  await userEvent.type(screen.getByLabelText(/위치/), '회의실');
  await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

  await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));

  await userEvent.clear(screen.getByLabelText(/반복 간격/));
  await userEvent.type(screen.getByLabelText(/반복 간격/), '0');

  await userEvent.click(screen.getByRole('button', { name: /일정 추가/ }));

  expect(await screen.findByText('반복 간격을 1 이상의 숫자로 입력해주세요.')).toBeInTheDocument();
});

it('반복 유형 선택 시 매일/매주/매월/매년 옵션이 모두 표시된다.', async () => {
  renderEventManageForm();

  await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));

  const select = screen.getByTestId('repeat-type-select');
  const options = within(select).getAllByRole('option');

  expect(options).toHaveLength(4);

  const expectedOptions = [
    { text: '매일', value: 'daily' },
    { text: '매주', value: 'weekly' },
    { text: '매월', value: 'monthly' },
    { text: '매년', value: 'yearly' },
  ];

  options.forEach((option, index) => {
    expect(option).toHaveTextContent(expectedOptions[index].text);
    expect(option).toHaveValue(expectedOptions[index].value);
  });
});

it('반복 일정 추가 시 캘린더에 Repeat Event 아이콘이 표시된다.', async () => {
  setupMockHandler();
  renderApp();

  await userEvent.type(screen.getByLabelText(/제목/), '팀 회의 제목');
  await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-03');
  await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
  await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
  await userEvent.type(screen.getByLabelText(/설명/), '팀 회의 설명');
  await userEvent.type(screen.getByLabelText(/위치/), '회의실');
  await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

  await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));
  await userEvent.type(screen.getByLabelText(/반복 종료일/), '2024-11-05');

  await userEvent.click(screen.getByRole('button', { name: /일정 추가/ }));

  const eventList = await screen.findByTestId('event-list');

  expect(within(eventList).getAllByText('팀 회의 제목')).toHaveLength(3);
  expect(within(eventList).getAllByLabelText('Repeat event')).toHaveLength(3);
});

it('반복 일정을 수정하면 해당 일정이 단일 일정으로 변경된다.', async () => {
  const initEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의 제목',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '1',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '팀 회의 제목',
      date: '2024-11-04',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '2',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '팀 회의 제목',
      date: '2024-11-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '3',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
  ];

  setupMockHandler(initEvents);
  renderApp();

  const eventList = await screen.findByTestId('event-list');

  const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });
  await userEvent.click(editButton[0]);

  await userEvent.clear(screen.getByLabelText(/설명/));
  await userEvent.type(screen.getByLabelText(/설명/), '팀 회의 설명 수정');
  await userEvent.click(screen.getByRole('button', { name: /일정 수정/ }));

  expect(within(eventList).getAllByText('팀 회의 제목')).toHaveLength(3);
  expect(within(eventList).getAllByLabelText('Repeat event')).toHaveLength(2);
});

it('반복 일정을 삭제하면 해당 일정만 삭제된다.', async () => {
  const initEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의 타이틀',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '1',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '팀 회의 타이틀',
      date: '2024-11-04',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '2',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '팀 회의 타이틀',
      date: '2024-11-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        id: '3',
        type: 'daily',
        interval: 1,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    },
  ];

  setupMockHandler(initEvents);
  renderApp();

  const eventList = await screen.findByTestId('event-list');

  const deleteButton = await within(eventList).findAllByRole('button', { name: 'Delete event' });
  expect(deleteButton).toHaveLength(3);
  await userEvent.click(deleteButton[0]);

  expect(within(eventList).getAllByText('팀 회의 타이틀')).toHaveLength(2);
});

it('단일 일정을 반복 일정으로 변경하면 해당 일정이 반복 일정으로 변경된다.', async () => {
  const initEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의 타이틀',
      date: '2024-11-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
  ];

  setupMockHandler(initEvents);
  renderApp();

  const eventList = await screen.findByTestId('event-list');

  const editButton = await within(eventList).findByRole('button', { name: 'Edit event' });
  await userEvent.click(editButton);

  await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));
  await userEvent.type(screen.getByLabelText(/반복 종료일/), '2024-11-05');

  await userEvent.click(screen.getByRole('button', { name: /일정 수정/ }));

  expect(within(eventList).getAllByText('팀 회의 타이틀')).toHaveLength(3);
  expect(within(eventList).getAllByLabelText('Repeat event')).toHaveLength(3);
});
