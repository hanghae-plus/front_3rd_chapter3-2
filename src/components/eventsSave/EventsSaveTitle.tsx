import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

interface EventsSaveTitleProps {
  title: string;
  // eslint-disable-next-line
  setTitle: (value: React.SetStateAction<string>) => void;
}

const EventsSaveTitle = ({ title, setTitle }: EventsSaveTitleProps) => {
  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }
  return (
    <>
      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input data-testid="title" value={title} onChange={handleTitleChange} />
      </FormControl>
    </>
  );
};

export default EventsSaveTitle;
