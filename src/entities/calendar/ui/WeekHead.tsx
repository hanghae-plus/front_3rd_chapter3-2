import { Th, Thead, Tr } from '@chakra-ui/react';

interface WeekDaysProps {
  weekDays: string[];
}

export const WeekHead = ({ weekDays }: WeekDaysProps) => {
  return (
    <Thead>
      <Tr>
        {weekDays.map((day) => (
          <Th key={day} width="14.28%">
            {day}
          </Th>
        ))}
      </Tr>
    </Thead>
  );
};
