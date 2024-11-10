import { Input } from '@atoms/Input';
import { FormControl, FormLabel, InputProps } from '@chakra-ui/react';
import React, { memo } from 'react';

interface InputWithLabelProps extends Omit<InputProps, 'onChange'> {
  type?: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
}

export const InputWithLabel: React.FC<InputWithLabelProps> = memo(
  ({ type = 'text', label, value, onChange, ...rest }) => {
    return (
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Input type={type} value={value} onChange={onChange} {...rest} />
      </FormControl>
    );
  }
);
