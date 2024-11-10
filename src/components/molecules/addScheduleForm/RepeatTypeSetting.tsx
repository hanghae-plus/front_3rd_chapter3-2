import { REPEAT_OPTIONS } from '@constants/options';
import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';
import { RepeatType } from 'src/types';

import { SelectWithLabel } from '../SelectWithLabel';

export const RepeatTypeSetting: React.FC = () => {
  const type = useScheduleForm((state) => state.repeat.type);
  const setRepeat = useScheduleForm((state) => state.setRepeat);
  return (
    <SelectWithLabel
      data-testid="schedule-repeat-type"
      label="반복 유형"
      value={type}
      onChange={(v) => setRepeat({ type: v as RepeatType })}
      options={[...REPEAT_OPTIONS]}
    />
  );
};
