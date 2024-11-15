import { Box, Flex } from '@chakra-ui/react';
import { useCalendarView } from '@features/calendar/model/hooks';
import { useEventOperations } from '@features/event/model/hooks';
import { useNotifications } from '@features/notification/model/hooks';
import { useSearch } from '@features/search/model/hooks';
import { CalendarView } from '@widgets/calendar/ui';
import { EventFormField, ClashEventDialog, EventView } from '@widgets/event/ui';
import { NotificationDialog } from '@widgets/notification/ui';

export const CalendarPage = () => {
  const { events, saveEvent, deleteEvent, deleteAllEvents } = useEventOperations();
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormField events={events} saveEvent={saveEvent} />

        <CalendarView
          view={view}
          setView={setView}
          navigate={navigate}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        <EventView
          hasEvent={events.length > 0}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          deleteEvent={deleteEvent}
          deleteAllEvents={deleteAllEvents}
          setSearchTerm={setSearchTerm}
        />
      </Flex>

      <ClashEventDialog saveEvent={saveEvent} />

      <NotificationDialog notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
};
