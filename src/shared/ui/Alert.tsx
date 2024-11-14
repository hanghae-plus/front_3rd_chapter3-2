import {
  AlertIcon,
  AlertProps,
  AlertTitle,
  Box,
  Alert as ChakraAlert,
  CloseButton,
} from '@chakra-ui/react';

type ChakraAlertProps = AlertProps & {
  message: string;
  onClose: () => void;
};

const Alert = ({ ...props }: ChakraAlertProps) => {
  return (
    <ChakraAlert {...props}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="sm">{props.message}</AlertTitle>
      </Box>
      <CloseButton onClick={props.onClose} />
    </ChakraAlert>
  );
};

export default Alert;
