import { Th, Tr } from '@chakra-ui/react';

import { CALENDAR_TABLE_COLUMN_WIDTH } from '../../constants';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const WeekDaysTableColumnHeader = () => {
  return (
    <Tr>
      {weekDays.map((day) => (
        <Th key={day} width={CALENDAR_TABLE_COLUMN_WIDTH}>
          {day}
        </Th>
      ))}
    </Tr>
  );
};
