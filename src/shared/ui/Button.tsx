import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

export const Button = ({ children, ...props }: ButtonProps) => (
  <ChakraButton {...props}>{children}</ChakraButton>
);
