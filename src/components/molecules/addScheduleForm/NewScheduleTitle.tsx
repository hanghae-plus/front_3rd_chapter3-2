import { InputWithLabel } from '@molecules/InputWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import { useCallback } from 'react';

import { TEST_ID } from '@/__tests__/constants';

export const NewScheduleTitle = () => {
  const title = useScheduleForm((state) => state.title);
  const setTitle = useScheduleForm((state) => state.setTitle);

  const handleChange = useCallback((value: string) => setTitle(value), [setTitle]);

  return (
    <InputWithLabel
      data-testid={TEST_ID.FORM.TITLE}
      label="제목"
      value={title}
      onChange={handleChange}
    />
  );
};
