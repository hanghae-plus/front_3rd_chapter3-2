import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

describe('일정 관리 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation();
    setupMockHandlerUpdating();
    setupMockHandlerDeletion();
  });

  // 1. 반복 유형 선택 테스트
  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    expect(repeatTypeSelect).toBeInTheDocument();

    expect(screen.getByText('매일')).toBeInTheDocument();
    expect(screen.getByText('매주')).toBeInTheDocument();
    expect(screen.getByText('매월')).toBeInTheDocument();
    expect(screen.getByText('매년')).toBeInTheDocument();
  });

  // 반복 유형 매일로 선택 테스트
  it('반복 유형을 매일로 선택하면 반복 유형이 매일로 업데이트되어야 한다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerUpdating();

    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const defaultOption = screen.getByRole('option', { name: '매일' }) as HTMLOptionElement;
    const selectedOption = screen.getByRole('option', { name: '매주' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'weekly');

    expect(defaultOption.selected).toBeFalsy();
    expect(selectedOption.selected).toBeTruthy();
  });
});

// 2. 반복 간격 설정 테스트
describe('반복 간격 설정', () => {
  it('각 반복 유형에 대해 올바른 간격을 설정할 수 있어야 한다', async () => {
    const { user } = setup(<App />);

    user.click(screen.getByLabelText('반복 일정'));

    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    await user.type(repeatIntervalInput, '3');

    expect(repeatIntervalInput).toHaveValue(3);
  });
});

// 3. 반복 일정 표시 테스트
describe('반복 일정 표시', () => {
  test('캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다', async () => {
    const mockEvent: Event = {
      id: '1',
      title: '반복 일정 테스트',
      date: '2024-10-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-10-20',
      },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      })
    );

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'month');

    await waitFor(() => {
      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      const eventElement = within(monthView).getByText('반복 일정 테스트');
      expect(eventElement).toBeInTheDocument();

      const repeatIcon = within(eventElement.closest('div') as HTMLElement).getByTestId(
        'repeat-icon'
      );
      expect(repeatIcon).toBeInTheDocument();
    });
  });
});

// 4. 반복 종료 조건 설정 테스트
describe('반복 종료 표시', () => {
  test('반복 종료 조건을 지정할 수 있다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '반복 일정 테스트');
    await user.type(screen.getByLabelText('날짜'), '2024-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const weeklyOption = within(repeatTypeSelect).getByText('매주');
    await user.selectOptions(repeatTypeSelect, weeklyOption.getAttribute('value') || 'weekly');

    const repeatEndDateInput = screen.getByLabelText('반복 종료일');
    await user.clear(repeatEndDateInput);
    await user.type(repeatEndDateInput, '2024-10-31');

    expect(repeatEndDateInput).toHaveValue('2024-10-31');
  });
});

// 5. 반복 일정 단일 수정 테스트
describe('반복 일정 단일 수정', () => {
  beforeEach(() => {
    setupMockHandlerUpdating();
  });

  test('반복 일정을 수정할 수 있고 수정하면 단일 일정으로 변경된다', async () => {
    const { user } = setup(<App />);

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    await user.click(screen.getByLabelText('반복 설정'));

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list');
    const updatedEvent = await within(eventList).findByText('수정된 회의');
    expect(updatedEvent).toBeInTheDocument();

    const repeatIcon = within(updatedEvent.closest('div') as HTMLElement).queryByTestId(
      'repeat-icon'
    );
    expect(repeatIcon).not.toBeInTheDocument();
  });
});

// 6. 반복 일정 단일 삭제 테스트
describe('반복 일정 단일 삭제', () => {
  beforeEach(() => {
    setupMockHandlerDeletion();
  });

  test('반복 일정을 삭제할 수 있다', async () => {
    const { user } = setup(<App />);

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    await waitFor(() => {
      const deletedEvent = screen.queryByText('삭제할 이벤트');
      expect(deletedEvent).not.toBeInTheDocument();
    });
  });
});
