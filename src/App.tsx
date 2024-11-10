import { Box, Flex } from '@chakra-ui/react';

import { AddAlertDialog } from './feature/addOrEdit/@components/AlertDialog.tsx';
import { AddOrEdit } from './feature/addOrEdit/index.tsx';
import { Calendar } from './feature/calendar/index.tsx';
import { Notifications } from './feature/notifications/index.tsx';
import { SearchCalendar } from './feature/searchCalendar/index.tsx';

function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <AddOrEdit />
        <Calendar />
        <SearchCalendar />
      </Flex>

      <Notifications />
      <AddAlertDialog />
    </Box>
  );
}

export default App;
