import { Box, Flex } from '@chakra-ui/react';

import { Calendar } from './components/Calendar.tsx';
import { DialogEventOverlapAlert } from './components/DialogEventOverlapAlert.tsx';
import { EventInputForm } from './components/EventInputForm.tsx';
import { EventSearchForm } from './components/EventSearchForm.tsx';
import { NotificationList } from './components/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { useEventFormStore } from './store/useEventFormStore.ts';

function App() {
  const { editingEvent, resetEditingEvent, editEvent } = useEventFormStore();

  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    resetEditingEvent
  );

  const { notifications, notifiedEvents, removeNotification } = useNotifications(events);

  const calendarView = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(
    events,
    calendarView.currentDate,
    calendarView.view
  );

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventInputForm events={events} saveEvent={saveEvent} />

        <Calendar
          {...calendarView}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventSearchForm
          deleteEvent={deleteEvent}
          editEvent={editEvent}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </Flex>

      <DialogEventOverlapAlert saveEvent={saveEvent} />

      <NotificationList notifications={notifications} removeNotification={removeNotification} />
    </Box>
  );
}

export default App;
