import { screen, within } from '@testing-library/react';

export const findEventInDayCell = (day: string | number, title: string) => {
  const monthView = screen.getByTestId('month-view');
  const dayCell = within(monthView).getByText(day).closest('td');
  return Array.from(dayCell!.querySelectorAll('*')).find((element) =>
    element.textContent?.includes(title)
  );
};
