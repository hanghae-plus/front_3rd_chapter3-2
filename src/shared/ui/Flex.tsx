import { Flex as ChakraFlex, FlexProps } from '@chakra-ui/react';

export const Flex = ({ children, ...props }: FlexProps) => (
  <ChakraFlex {...props}>{children}</ChakraFlex>
);
