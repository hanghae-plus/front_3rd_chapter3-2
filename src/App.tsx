import { Box, Flex } from '@chakra-ui/react';

import { Calendar } from './components/calendar/Calendar';
import { Dialog } from './components/dialog/Dialog.tsx';
import { EventForm } from './components/eventForm/EventForm.tsx';
import { EventList } from './components/eventList/EventList';

function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm />
        <Calendar />
        <EventList />
      </Flex>
      <Dialog />
    </Box>
  );
}

export default App;
