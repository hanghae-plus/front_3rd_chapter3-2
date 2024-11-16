import { Box, Flex } from '@chakra-ui/react';

import { Notification } from './components/alerts/Notification.tsx';
import { OverlapAlertDialog } from './components/alerts/OverlapAlertDialog.tsx';
import { Calendar } from './components/calendarView/Calendar.tsx';
import { EventManageForm } from './components/eventManageView/EventManageForm.tsx';
import { EventSearch } from './components/eventSearchView/EventSearch.tsx';

function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventManageForm />
        <Calendar />
        <EventSearch />
      </Flex>

      <OverlapAlertDialog />
      <Notification />
    </Box>
  );
}

export default App;
