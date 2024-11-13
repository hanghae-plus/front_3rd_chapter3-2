// src/__mocks__/chakra-ui-mock.tsx
import React from 'react';
import { vi } from 'vitest';

vi.mock('@chakra-ui/react', () => ({
  __esModule: true,
  ChakraProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToast: () => vi.fn(),
  useDisclosure: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
  }),
  useColorModeValue: (light: any) => light,
  FormControl: ({ children, ...props }: any) => (
    <div role="group" {...props}>
      {children}
    </div>
  ),
  FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Input: (props: any) => <input {...props} />,
  Select: (props: any) => <select {...props} />,
  Button: (props: any) => <button {...props}>{props.children}</button>,
  IconButton: (props: any) => (
    <button aria-label={props['aria-label']} {...props}>
      {props.children}
    </button>
  ),
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogBody: ({ children }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogOverlay: ({ children }: any) => <div>{children}</div>,
}));

// 아이콘 모킹
vi.mock('@chakra-ui/icons', () => ({
  DeleteIcon: () => <span>DeleteIcon</span>,
  EditIcon: () => <span>EditIcon</span>,
  RepeatIcon: () => <span>RepeatIcon</span>,
}));
