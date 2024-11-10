import { CheckBoxWithLabel } from '@molecules/CheckBoxWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React, { useCallback } from 'react';

export const RepeatCheckBox: React.FC = () => {
  const isRepeating = useScheduleForm((state) => state.isRepeating);
  const setIsRepeating = useScheduleForm((state) => state.setIsRepeating);

  const handleChange = useCallback((checked: boolean) => setIsRepeating(checked), [setIsRepeating]);

  return (
    <CheckBoxWithLabel
      data-testid="schedule-repeat-setting"
      label="반복 설정"
      checkBoxLabel="반복 일정"
      isChecked={isRepeating}
      onChange={handleChange}
    />
  );
};
