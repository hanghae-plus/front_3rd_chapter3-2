import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

import { EventManageForm } from '../components/eventManageView/EventManageForm';

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
  await userEvent.type(screen.getByLabelText(/반복 간격/), '0');

  await userEvent.click(screen.getByRole('button', { name: /일정 추가/ }));

  expect(screen.getByText('반복 간격을 1 이상의 숫자로 입력해주세요.')).toBeInTheDocument();
});

it('반복 유형 선택 시 매일/매주/매월/매년 옵션이 모두 표시된다.', async () => {
  renderEventManageForm();

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

it('반복 일정을 수정하면 해당 일정이 단일 일정으로 변경된다.', () => {});

it('반복 일정을 삭제하면 해당 일정만 삭제된다.', () => {});
