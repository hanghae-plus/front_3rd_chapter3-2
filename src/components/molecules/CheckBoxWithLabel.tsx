import { Checkbox } from '@atoms/Checkbox';
import { CheckboxProps, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';

interface PropsType extends Omit<CheckboxProps, 'onChange'> {
  label: string;
  checkBoxLabel: string;
  isChecked: boolean;
  onChange: (v: boolean) => void;
}

export const CheckBoxWithLabel: React.FC<PropsType> = ({
  label,
  checkBoxLabel,
  isChecked,
  onChange,
  ...rest
}) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Checkbox isChecked={isChecked} onChange={onChange} {...rest}>
        {checkBoxLabel}
      </Checkbox>
    </FormControl>
  );
};
