import {
  AlertDialog as ChakraAlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  HTMLChakraProps,
} from '@chakra-ui/react';
import React from 'react';

// AlertDialogContainer ==================================================

type ContainerProps = AlertDialogProps & {
  children: React.ReactNode;
};

const Container = ({ children, ...props }: ContainerProps) => {
  return (
    <ChakraAlertDialog {...props}>
      <AlertDialogOverlay>
        <AlertDialogContent>{children}</AlertDialogContent>
      </AlertDialogOverlay>
    </ChakraAlertDialog>
  );
};

// AlertDialogHeader ======================================================

type HeaderProps = HTMLChakraProps<'header'>;

const Header = ({ ...props }: HeaderProps) => {
  return <AlertDialogHeader {...props}>{props.children}</AlertDialogHeader>;
};

// AlertDialogBody ========================================================

type BodyProps = HTMLChakraProps<'div'>;

const Body = ({ ...props }: BodyProps) => {
  return <AlertDialogBody {...props}>{props.children}</AlertDialogBody>;
};

// AlertDialogFooter ======================================================

type FooterProps = HTMLChakraProps<'footer'>;

const Footer = ({ ...props }: FooterProps) => {
  return <AlertDialogFooter {...props}>{props.children}</AlertDialogFooter>;
};

// AlertDialog =================================================================

const AlertDialog = Object.assign(
  {},
  {
    Container,
    Header,
    Body,
    Footer,
  }
);

export default AlertDialog;
