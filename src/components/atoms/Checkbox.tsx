import { Checkbox as ChakraCheckbox, CheckboxProps } from '@chakra-ui/react';
import React, { useCallback } from 'react';

interface AtomCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<AtomCheckboxProps> = ({ onChange, ...rest }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked); // checked 값만 반환
    },
    [onChange]
  );

  return <ChakraCheckbox {...rest} onChange={handleChange} />;
};
