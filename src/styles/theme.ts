import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      '*::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'gray.100',
        borderRadius: '10px',
      },
      '*::-webkit-scrollbar-thumb': {
        background: 'gray.300',
        borderRadius: '10px',
        '&:hover': {
          background: 'gray.400',
        },
      },
    },
  },
});

export default theme;
