import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { FC } from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const InputField: FC<FormFieldProps> = ({ label, value, onChange }) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </FormControl>
  );
};
