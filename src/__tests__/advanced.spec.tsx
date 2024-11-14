import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

describe('일정 생성-수정-삭제 통합 테스트', () => {
  it('반복 일정을 생성하고 수정한 뒤 삭제할 수 있다', async () => {
    let testEvents: any[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: testEvents });
      }),

      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: any[] };
        const events = body?.events?.map((event: any) => ({
          id: 'test-id',
          ...event,
          repeat: {
            ...event.repeat,
            id: 'test-repeat-id',
          },
        }));
        testEvents = events;
        return HttpResponse.json(events);
      }),

      http.put('/api/events-list', () => {
        return HttpResponse.json({ events: [] });
      }),

      http.delete('/api/events-list', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup(<App />);

    // 1. 일정 생성
    await user.type(screen.getByLabelText('제목'), '통합 테스트 회의');
    await user.type(screen.getByLabelText('날짜'), '2024-11-20');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '통합 테스트용 설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    // 2. 반복 설정
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const repeatCheckbox = screen.getByLabelText('반복 설정');
    expect(repeatCheckbox).toBeInTheDocument();
    user.click(repeatCheckbox);
    await user.selectOptions(repeatTypeSelect, 'weekly');
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), '2');
    await user.type(screen.getByLabelText('반복 종료일'), '2024-12-20');

    // 3. 알림 설정
    await user.selectOptions(screen.getByLabelText('알림 설정'), '60');

    // 4. 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 5. 생성된 일정 확인
    await waitFor(() => {
      console.log('현재 DOM 구조:');
      screen.debug();
      const eventList = screen.getByTestId('event-list');
      console.log('이벤트 리스트 내부:');
      expect(within(eventList).getByText('통합 테스트 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('통합 테스트용 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
      expect(within(eventList).getByText('카테고리: 업무')).toBeInTheDocument();
      expect(within(eventList).getByText(/반복: 2주마다/)).toBeInTheDocument();
      expect(within(eventList).getByText(/알림: 1시간 전/)).toBeInTheDocument();
    });

    // 6. 일정 수정
    const editButton = screen.getByLabelText('Edit event');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText('제목')).toHaveValue('통합 테스트 회의');
    });

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '회의실 B');

    await user.click(screen.getByTestId('event-submit-button'));

    // 7. 수정된 일정 확인
    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('수정된 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 B')).toBeInTheDocument();
    });

    // 8. 일정 삭제
    const deleteButton = screen.getByLabelText('Delete event');
    await user.click(deleteButton);

    // 9. 삭제 확인
    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).queryByText('수정된 회의')).not.toBeInTheDocument();
      expect(within(eventList).queryByText('수정된 설명')).not.toBeInTheDocument();
    });
  });
});
