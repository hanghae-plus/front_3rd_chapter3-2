import { HStack as ChakraHStack, VStack as ChakraVStack, StackProps } from '@chakra-ui/react';

export const HStack = ({ children, ...props }: StackProps) => (
  <ChakraHStack {...props}>{children}</ChakraHStack>
);

export const VStack = ({ children, ...props }: StackProps) => (
  <ChakraVStack {...props}>{children}</ChakraVStack>
);
