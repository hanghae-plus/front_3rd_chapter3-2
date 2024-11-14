// test.spec.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '../App';

const setup = () => {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    ),
  };
};

const createBasicEvent = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('제목'), '정기 회의');
  await user.type(screen.getByLabelText('날짜'), '2024-03-15');
  await user.type(screen.getByLabelText('시작 시간'), '09:00');
  await user.type(screen.getByLabelText('종료 시간'), '10:00');
  await user.type(screen.getByLabelText('설명'), '팀 정기 회의');
  await user.type(screen.getByLabelText('위치'), '회의실 1');
  await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
  await user.click(screen.getByText('반복 일정'));
};

describe('반복 일정 통합 테스트', () => {
  it('반복 일정 생성: 반복 유형과 간격을 설정할 수 있다', async () => {
    const { user } = setup();

    await createBasicEvent(user);

    // 반복 설정
    await user.selectOptions(screen.getByLabelText(/반복 유형/), 'weekly');
    const intervalInput = screen.getByLabelText(/반복 간격/);
    await user.clear(intervalInput);
    await user.type(intervalInput, '2');
    await user.type(screen.getByLabelText(/반복 종료일/), '2024-06-30');

    await user.click(screen.getByTestId('event-submit-button'));

    // 생성된 반복 일정 확인
    const events = screen.getAllByText('정기 회의');
    expect(events.length).toBeGreaterThan(1);
  });

  it('반복 일정 표시: 캘린더에 반복 아이콘과 함께 표시된다', async () => {
    const { user } = setup();

    await createBasicEvent(user);
    await user.selectOptions(screen.getByLabelText(/반복 유형/), 'weekly');
    await user.click(screen.getByTestId('event-submit-button'));

    // 월간 보기로 전환
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 반복 아이콘 확인
    const monthView = screen.getByTestId('month-view');
    const repeatIcons = within(monthView).getAllByTestId('repeat-icon');
    expect(repeatIcons.length).toBeGreaterThan(0);
  });

  it('반복 일정 수정: 단일 일정으로 변경된다', async () => {
    const { user } = setup();

    // 반복 일정 생성
    await createBasicEvent(user);
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');
    await user.click(screen.getByTestId('event-submit-button'));

    // 첫 번째 일정 수정
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 제목 수정 후 저장
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 일정이 반복 아이콘을 포함하지 않는지 확인
    const modifiedEvent = screen.getByText('수정된 회의');
    const container = modifiedEvent.closest('.chakra-box');
    const repeatIcon = container?.querySelector('[data-testid="repeat-icon"]');
    expect(repeatIcon).toBeNull();
  });

  it('반복 일정 삭제: 해당 일정만 삭제된다', async () => {
    const { user } = setup();

    // 반복 일정 생성
    await createBasicEvent(user);
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');
    await user.click(screen.getByTestId('event-submit-button'));

    // 초기 이벤트 개수 확인
    const initialEvents = screen.getAllByText('정기 회의');
    const initialCount = initialEvents.length;

    // 첫 번째 일정 삭제
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 삭제 후 이벤트 개수 확인
    const remainingEvents = screen.getAllByText('정기 회의');
    expect(remainingEvents.length).toBe(initialCount - 1);
  });

  it('반복 종료: 지정된 종료일까지만 일정이 생성된다', async () => {
    const { user } = setup();
    await createBasicEvent(user);
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');
    await user.type(screen.getByLabelText('반복 종료일'), '2024-06-30');
    await user.click(screen.getByTestId('event-submit-button'));

    // 2024-07-01 이후의 일정이 없는지 확인
    const events = screen.getAllByText('정기 회의');
    events.forEach((event) => {
      const dateElement = event.closest('.chakra-box')?.querySelector('time');
      const eventDate = dateElement?.getAttribute('datetime');
      if (eventDate) {
        expect(new Date(eventDate).getTime()).toBeLessThanOrEqual(new Date('2024-07-01').getTime());
      }
    });
  });
});
