import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

import { EventForm } from '../components/eventForm/EventForm';

interface ProviderProps {
  initialValues: [atom: any, value: any][];
  children: React.ReactNode;
}

const AtomsProvider = ({ initialValues, children }: ProviderProps) => {
  useHydrateAtoms(initialValues);
  return children;
};

const CustomProvider = ({ initialValues, children }: ProviderProps) => (
  <Provider>
    <AtomsProvider initialValues={initialValues}>{children}</AtomsProvider>
  </Provider>
);

const renderEventForm = (initialValues?: [atom: any, value: any][]) => {
  if (initialValues) {
    return render(
      <ChakraProvider>
        <CustomProvider initialValues={initialValues}>
          <EventForm />
        </CustomProvider>
      </ChakraProvider>
    );
  } else {
    return render(
      <ChakraProvider>
        <Provider>
          <EventForm />
        </Provider>
      </ChakraProvider>
    );
  }
};

describe('반복 유형 선택', () => {
  it('반복 일정 미체크 시 반복 유형 옵션이 뜨지 않는다.', async () => {
    renderEventForm();

    const repeatTypeSelect = screen.queryByLabelText(/반복 유형/);
    const repeatInterval = screen.queryByLabelText(/반복 간격/);
    const repeatEnd = screen.queryByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).not.toBeInTheDocument();
    expect(repeatInterval).not.toBeInTheDocument();
    expect(repeatEnd).not.toBeInTheDocument();
  });

  it('반복 일정 체크 시 반복 유형 옵션이 뜬다.', async () => {
    renderEventForm();

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/ });
    await userEvent.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText(/반복 유형/);
    const repeatInterval = screen.getByLabelText(/반복 간격/);
    const repeatEnd = screen.getByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).toBeInTheDocument();
    expect(repeatInterval).toBeInTheDocument();
    expect(repeatEnd).toBeInTheDocument();
  });

  it('반복 유형 SELECT 옵션이 모두 표시된다.(매일/매주/매월/매년 옵션이 있어야 함)', async () => {
    renderEventForm();

    await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));

    const select = screen.getByTestId('repeat-type-select');
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(4);

    const expectedOptions = ['매일', '매주', '매월', '매년'];

    options.forEach((option, index) => {
      expect(option).toHaveTextContent(expectedOptions[index]);
    });
  });
});
describe('반복 간격 설정', () => {
  it('반복 간격을 0으로 작성 후 일정 추가 시 반복 간격을 1 이상의 숫자로 입력해주세요 문구가 뜬다', async () => {
    renderEventForm();

    await userEvent.type(screen.getByLabelText(/제목/), '제목');
    await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-13');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
    await userEvent.type(screen.getByLabelText(/설명/), '설명');
    await userEvent.type(screen.getByLabelText(/위치/), '위치');
    await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));

    await userEvent.clear(screen.getByLabelText(/반복 간격/));
    await userEvent.type(screen.getByLabelText(/반복 간격/), '0');

    await userEvent.click(screen.getByRole('button', { name: /일정 추가/ }));

    expect(
      await screen.findByText('반복 간격을 1 이상의 숫자로 입력해주세요.')
    ).toBeInTheDocument();
  });
});
describe('반복 일정 표시', () => {});
describe('반복 종료', () => {});
describe('반복 일정 단일 수정', () => {});
describe('반복 일정 단일 삭제', () => {});
