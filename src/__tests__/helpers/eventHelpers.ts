import { screen, within } from '@testing-library/react';

// event-list에서 이벤트 확인 함수
export const checkEventInEventList = (eventTitle: string) => {
  const eventList = screen.getByTestId('event-list');
  const event = within(eventList).getByText(eventTitle);
  expect(event).toBeInTheDocument();
};
