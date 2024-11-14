import { CheckBoxWithLabel } from '@molecules/CheckBoxWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React, { useCallback } from 'react';

import { TEST_ID } from '@/constants/testID';

export const RepeatCheckBox: React.FC = () => {
  const isRepeating = useScheduleForm((state) => state.isRepeating);
  const setIsRepeating = useScheduleForm((state) => state.setIsRepeating);

  const handleChange = useCallback((checked: boolean) => setIsRepeating(checked), [setIsRepeating]);

  return (
    <CheckBoxWithLabel
      data-testid={TEST_ID.FORM.REPEAT_SET}
      label="반복 설정"
      checkBoxLabel="반복 일정"
      isChecked={isRepeating}
      onChange={handleChange}
    />
  );
};
