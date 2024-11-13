import { Box, Flex } from '@chakra-ui/react';

import { Calendar } from './components/Calendar/Calendar.tsx';
import { DialogEventOverlapAlert } from './components/DialogEventOverlapAlert.tsx';
import { EventInputForm } from './components/EventInputForm/EventInputForm.tsx';
import { EventSearchForm } from './components/EventSearchForm.tsx';
import { NotificationList } from './components/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { useEventFormStore } from './store/useEventFormStore.ts';

function App() {
  const { editingEvent, resetEditingEvent } = useEventFormStore();
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    resetEditingEvent
  );

  const calendarView = useCalendarView();
  const eventSearch = useSearch(events, calendarView.currentDate, calendarView.view);
  const { notifications, notifiedEvents, removeNotification } = useNotifications(events);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventInputForm events={events} saveEvent={saveEvent} />

        <Calendar
          {...calendarView}
          filteredEvents={eventSearch.filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventSearchForm
          {...eventSearch}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
        />
      </Flex>

      <DialogEventOverlapAlert saveEvent={saveEvent} />

      <NotificationList notifications={notifications} removeNotification={removeNotification} />
    </Box>
  );
}

export default App;
