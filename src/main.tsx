import { ChakraProvider } from '@chakra-ui/react';
import { OverlayProvider } from 'overlay-kit';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <OverlayProvider>
        <App />
      </OverlayProvider>
    </ChakraProvider>
  </React.StrictMode>
);
