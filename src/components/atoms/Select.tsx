import { Select as ChakraSelect, SelectProps } from '@chakra-ui/react';
import React, { useCallback } from 'react';

interface AtomSelectProps extends Omit<SelectProps, 'onChange'> {
  onChange: (v: string) => void;
}

export const Select: React.FC<AtomSelectProps> = ({ children, onChange, ...rest }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <ChakraSelect {...rest} onChange={handleChange}>
      {children}
    </ChakraSelect>
  );
};
