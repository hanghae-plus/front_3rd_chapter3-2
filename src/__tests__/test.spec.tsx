import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
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
    await user.type(screen.getByTestId('title-input'), '정기 회의');
    await user.type(screen.getByTestId('date-input'), '2024-03-15');
    await user.type(screen.getByTestId('start-time-input'), '09:00');
    await user.type(screen.getByTestId('end-time-input'), '10:00');
    await user.type(screen.getByTestId('description-input'), '팀 정기 회의');
    await user.type(screen.getByTestId('location-input'), '회의실 1');
    await user.selectOptions(screen.getByTestId('category-select'), '업무');
    await user.click(screen.getByTestId('repeat-checkbox'));
  };

describe('반복 일정 통합 테스트', () => {
    it('반복 일정 생성: 반복 유형과 간격을 설정할 수 있다', async () => {
        const { user } = setup();
    
        await createBasicEvent(user);
        
        await user.selectOptions(screen.getByTestId('repeat-type-select'), 'weekly');
        await user.clear(screen.getByTestId('repeat-interval-input'));
        await user.type(screen.getByTestId('repeat-interval-input'), '2');
        await user.type(screen.getByTestId('repeat-end-date-input'), '2024-06-30');
        
        await user.click(screen.getByTestId('event-submit-button'));

        await waitFor(() => {
        const events = screen.getAllByText('정기 회의');
        expect(events.length).toBeGreaterThan(1);
        });
    });

    it('반복 일정 표시: 캘린더에 반복 아이콘과 함께 표시된다', async () => {
        const { user } = setup();
        
        await createBasicEvent(user);
        await user.selectOptions(screen.getByLabelText('반복 유형', { exact: true }), 'weekly');
        await user.click(screen.getByTestId('event-submit-button'));

        await user.selectOptions(screen.getByLabelText('view'), 'month');
        
        await waitFor(() => {
            const monthView = screen.getByTestId('month-view');
            const repeatIcons = within(monthView).queryAllByTestId('repeat-icon');
            expect(repeatIcons.length).toBeGreaterThan(0);
        });
    });
    

    it('반복 일정 수정: 단일 일정으로 변경된다', async () => {
        const { user } = setup();
        
        await createBasicEvent(user);
        await user.selectOptions(screen.getByLabelText('반복 유형', { exact: true }), 'weekly');
        await user.click(screen.getByTestId('event-submit-button'));
    
        await waitFor(async () => {
          const editButton = await screen.findAllByTestId('edit-button');
          await user.click(editButton[0]);
    
          await user.clear(screen.getByLabelText('제목', { exact: true }));
          await user.type(screen.getByLabelText('제목', { exact: true }), '수정된 회의');
          await user.click(screen.getByTestId('event-submit-button'));
    
          const modifiedEvent = await screen.findByText('수정된 회의');
          const container = modifiedEvent.closest('.chakra-box');
          const repeatIcon = container?.querySelector('[data-testid="repeat-icon"]');
          expect(repeatIcon).toBeNull();
        });
      });
    
    it('반복 일정 삭제: 해당 일정만 삭제된다', async () => {
        const { user } = setup();
        
        await createBasicEvent(user);
        await user.selectOptions(screen.getByLabelText('반복 유형', { exact: true }), 'weekly');
        await user.click(screen.getByTestId('event-submit-button'));

        await waitFor(async () => {
        const initialEvents = await screen.findAllByText('정기 회의');
        const initialCount = initialEvents.length;

        const deleteButton = await screen.findAllByTestId('delete-button');
        await user.click(deleteButton[0]);

        const remainingEvents = await screen.findAllByText('정기 회의');
        expect(remainingEvents.length).toBe(initialCount - 1);
        });
    });

    it('반복 종료: 지정된 종료일까지만 일정이 생성된다', async () => {
        const { user } = setup();
        
        await createBasicEvent(user);
        await user.selectOptions(screen.getByLabelText('반복 유형', { exact: true }), 'weekly');
        await user.type(screen.getByLabelText('반복 종료일', { exact: true }), '2024-06-30');
        await user.click(screen.getByTestId('event-submit-button'));
    
        await waitFor(() => {
          const events = screen.getAllByText('정기 회의');
          events.forEach(event => {
            const dateElement = event.closest('.chakra-box')?.querySelector('text');
            const dateText = dateElement?.textContent;
            if (dateText) {
              const eventDate = new Date(dateText);
              expect(eventDate.getTime()).toBeLessThanOrEqual(new Date('2024-07-01').getTime());
            }
          });
        });
    });
 });
