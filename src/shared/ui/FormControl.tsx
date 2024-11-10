import {
  FormControl as ChakraFormControl,
  FormControlProps,
  FormLabelProps,
  FormLabel as ChakraFormLabel,
} from '@chakra-ui/react';

export const FormControl = ({ children, ...props }: FormControlProps) => (
  <ChakraFormControl {...props}>{children}</ChakraFormControl>
);

export const FormLabel = (props: FormLabelProps) => <ChakraFormLabel {...props} />;
