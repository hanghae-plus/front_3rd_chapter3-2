import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import DialogProvider from './context/DialogProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </ChakraProvider>
  </React.StrictMode>
);
