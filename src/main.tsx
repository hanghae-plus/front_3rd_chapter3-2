import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { CombinedContextProvider } from './provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <CombinedContextProvider>
        <App />
      </CombinedContextProvider>
    </ChakraProvider>
  </React.StrictMode>
);
