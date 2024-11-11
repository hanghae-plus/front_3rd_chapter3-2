import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { FC } from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  type?: 'text' | 'number' | 'date';
  onChange: (value: string) => void;
}

export const InputField: FC<FormFieldProps> = ({ label, value, onChange, type = 'text' }) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </FormControl>
  );
};
