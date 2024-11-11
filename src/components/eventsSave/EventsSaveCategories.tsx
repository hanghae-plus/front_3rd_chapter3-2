import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import React from 'react';

import { categories } from '../../constants';

interface EventsSaveCategoriesProps {
  category: string;
  // eslint-disable-next-line
  setCategory: (value: React.SetStateAction<string>) => void;
}

const EventsSaveCategories = ({ category, setCategory }: EventsSaveCategoriesProps) => {
  function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(event.target.value);
  }
  return (
    <>
      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select data-testid="category" value={category} onChange={handleCategoryChange}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default EventsSaveCategories;
