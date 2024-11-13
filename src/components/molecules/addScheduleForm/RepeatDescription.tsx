import { InputWithLabel } from '@molecules/InputWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { TEST_ID } from '@/constants/testID';

export const RepeatDescription: React.FC = () => {
  const description = useScheduleForm((state) => state.description);
  const setDescription = useScheduleForm((state) => state.setDescription);

  return (
    <InputWithLabel
      data-testid={TEST_ID.FORM.DESCRIPTION}
      label="설명"
      value={description}
      onChange={setDescription}
    />
  );
};
