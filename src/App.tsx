import { Box, Flex } from '@chakra-ui/react';

import { CalendarForm } from './components/calendar/CalendarForm.tsx';
import { CalendarNotification } from './components/calendar/CalendarNotification.tsx';
import { CalendarSearch } from './components/calendar/CalendarSearch.tsx';
import { CalendarView } from './components/calendar/CalendarView.tsx';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { CalendarViewHookProvider } from './providers/CalendarViewHookProvider.tsx';
import { DialogProvider } from './providers/DialogProvider.tsx';

function App() {
  const { editingEvent, setEditingEvent, editEvent } = useEventForm();

  const { events, saveEvent, saveEventsList, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  return (
    <DialogProvider>
      <CalendarViewHookProvider>
        <Box w="full" h="100vh" m="auto" p={5}>
          <Flex gap={6} h="full">
            <CalendarForm
              events={events}
              editingEvent={editingEvent}
              saveEvent={saveEvent}
              saveEventsList={saveEventsList}
            />

            <CalendarView events={events} />

            <CalendarSearch events={events} editEvent={editEvent} deleteEvent={deleteEvent} />
          </Flex>

          <CalendarNotification events={events} />
        </Box>
      </CalendarViewHookProvider>
    </DialogProvider>
  );
}

export default App;
