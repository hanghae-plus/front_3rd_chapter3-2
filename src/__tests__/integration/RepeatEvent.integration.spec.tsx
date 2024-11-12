import { ReactElement } from 'react';
import { userEvent } from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from '../../App.tsx';
import { expect } from 'vitest';
import { Event } from '../../types.ts';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.selectOptions(screen.getByLabelText('반복 간격'), repeat.interval);
  await user.selectOptions(screen.getByLabelText('반복 종료일'), repeat.endDate);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 등록/조회', () => {
  it('일정 반복 설정 시 필수 입력 필드들이 표출된다.', async () => {
    setup(<App />);

    const eventForm = screen.getByTestId('event-form');

    expect(within(eventForm).getByLabelText('반복 유형')).toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 간격')).toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('일정 반복 설정 해제 시 필수 입력 필드들이 사라진다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    const eventForm = screen.getByTestId('event-form');

    expect(within(eventForm).getByLabelText('반복 유형')).not.toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 종료일')).not.toBeInTheDocument();
  });

  it('과거 날짜로 종료일 설정 시 에러가 발생한다.', () => {});

  it('등록하려는 날짜보다 월의 수가 더 적을 때 경고 문구가 뜨고 해당 월의 마지막 날에 일정이 등록된다.', () => {});

  it('반복 일정일 경우 일정 뷰에서 아이콘과 함께 표시된다.', () => {});
});

describe('반복 일정 수정/삭제', () => {
  it('반복 일정 중 특정 날짜만 수정할 수 있다.', () => {});

  it('반복 일정 전체를 수정할 수 있다.', () => {});

  it('반복 일정 설정 해제 시 단일 일정으로 수정되고 일정 뷰에서도 아이콘이 사라진다.', () => {});

  it('반복 일정일 경우 일정 뷰에서 아이콘과 함께 표시된다.', () => {});

  it('반복 일정 삭제 시 해당 일정만 삭제된다.', () => {});
});
