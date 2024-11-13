import { CATEGORIES } from '@constants/categories';
import useScheduleForm from '@stores/useScheduleForm';

import { SelectWithLabel } from './SelectWithLabel';

import { TEST_ID } from '@/__tests__/constants';

export const SelectCategory = () => {
  const category = useScheduleForm((state) => state.category);
  const setCategory = useScheduleForm((state) => state.setCategory);

  return (
    <SelectWithLabel
      data-testid={TEST_ID.FORM.CATEGORY}
      label="카테고리"
      value={category}
      onChange={(e) => setCategory(e as string)}
      options={[...CATEGORIES]}
    />
  );
};
