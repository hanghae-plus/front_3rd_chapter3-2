import { FormControl, FormLabel, Select, SelectProps } from '@chakra-ui/react';
import React from 'react';

interface SelectFieldProps extends Omit<SelectProps, 'onChange'> {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  children,
  placeholder,
  ...props
}) => {
  // defaultValue를 처리하기 위한 내부 상태
  const [internalValue, setInternalValue] = React.useState(value);

  // value가 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInternalValue(e.target.value);
    onChange(e);
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select value={internalValue} onChange={handleChange} placeholder={placeholder} {...props}>
        {children}
      </Select>
    </FormControl>
  );
};
