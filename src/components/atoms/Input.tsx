import { Input as ChakraInput, InputProps } from '@chakra-ui/react';
import React, { memo, useCallback } from 'react';

interface AtomInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (v: string) => void;
  onEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const Input: React.FC<AtomInputProps> = memo(
  ({ onChange, onEnter = () => null, onBlur = () => null, children, ...rest }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      [onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onEnter?.(e);
      },
      [onEnter]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => onBlur?.(e),
      [onBlur]
    );

    return (
      <ChakraInput {...rest} onChange={handleChange} onKeyDown={handleKeyDown} onBlur={handleBlur}>
        {children}
      </ChakraInput>
    );
  }
);
