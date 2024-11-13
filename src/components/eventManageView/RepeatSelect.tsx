import { Select } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

export interface Props {
  repeatType: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const RepeatSelect = ({ repeatType, onChange }: Props) => {
  return (
    <Select value={repeatType} onChange={onChange} data-testid="repeat-type-select">
      <option value="daily">매일</option>
      <option value="weekly">매주</option>
      <option value="monthly">매월</option>
      <option value="yearly">매년</option>
    </Select>
  );
};

export default RepeatSelect;
