import { useSearch } from '@hooks/useSearch';
import { InputWithLabel } from '@molecules/InputWithLabel';
import React from 'react';

import { TEST_ID } from '@/__tests__/constants';

export const SearchInput: React.FC = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  return (
    <InputWithLabel
      data-testid={TEST_ID.SEARCH}
      label="일정 검색"
      value={searchTerm}
      onChange={setSearchTerm}
      placeholder="검색어를 입력하세요"
    />
  );
};
