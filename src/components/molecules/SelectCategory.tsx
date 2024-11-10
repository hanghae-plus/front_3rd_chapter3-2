import { CATEGORIES } from '@constants/categories';
import useScheduleForm from '@stores/useScheduleForm';

import { SelectWithLabel } from './SelectWithLabel';

export const SelectCategory = () => {
  const category = useScheduleForm((state) => state.category);
  const setCategory = useScheduleForm((state) => state.setCategory);

  return (
    <SelectWithLabel
      data-testid="schedule-category"
      label="카테고리"
      value={category}
      onChange={(e) => setCategory(e as string)}
      options={[...CATEGORIES]}
    />
  );
};
