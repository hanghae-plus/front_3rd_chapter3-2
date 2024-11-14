import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const getCurrentYearMonth = () => {
  const currentMonthYearText = screen.getByTestId('current-month-year').textContent; // 예: '2024년 2월'
  const [year, month] = currentMonthYearText!.match(/\d+/g)!.map(Number);
  return { year, month };
};

export const navigateToYearMonth = async (
  user: ReturnType<typeof userEvent.setup>,
  targetYear: number,
  targetMonth: number
) => {
  while (!screen.queryByText(`${targetYear}년 ${targetMonth}월`)) {
    await user.click(screen.getByLabelText(targetYear < 2024 ? 'Previous' : 'Next'));
  }
};
