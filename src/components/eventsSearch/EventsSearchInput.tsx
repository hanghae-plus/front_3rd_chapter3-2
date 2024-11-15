import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';
interface EventsSearchInputProps {
  searchTerm: string;
  // eslint-disable-next-line
  setSearchTerm: (value: React.SetStateAction<string>) => void;
}

const EventsSearchInput = ({ searchTerm, setSearchTerm }: EventsSearchInputProps) => {
  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  return (
    <>
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </FormControl>
    </>
  );
};

export default EventsSearchInput;
