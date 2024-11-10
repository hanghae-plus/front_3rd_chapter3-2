import { InputWithLabel } from '@molecules/InputWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import { useCallback } from 'react';

export const NewScheduleTitle = () => {
  const title = useScheduleForm((state) => state.title);
  const setTitle = useScheduleForm((state) => state.setTitle);

  const handleChange = useCallback((value: string) => setTitle(value), [setTitle]);

  return (
    <InputWithLabel
      data-testid="schedule-title"
      label="제목"
      value={title}
      onChange={handleChange}
    />
  );
};
