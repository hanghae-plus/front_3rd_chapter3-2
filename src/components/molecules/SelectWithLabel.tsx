import { Select } from '@atoms/Select';
import { FormControl, FormLabel, SelectProps } from '@chakra-ui/react';
import React from 'react';
import { RepeatType } from 'src/types';

interface SelectWithInputProps extends Omit<SelectProps, 'onChange'> {
  value: string | number | RepeatType;
  label: string;
  onChange: (v: string | number | RepeatType) => void;
  options: { label: string; value: string | number | RepeatType }[];
}

export const SelectWithLabel: React.FC<SelectWithInputProps> = ({
  value,
  label,
  onChange,
  options,
  ...rest
}) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select value={value} onChange={onChange} {...rest}>
        {options.map((option, index) => (
          <option key={`${index}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};
