import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';

import EventProvider from '@/features/event/model/EventContext';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <EventProvider>
      <ChakraProvider>{children}</ChakraProvider>
    </EventProvider>
  );
};
