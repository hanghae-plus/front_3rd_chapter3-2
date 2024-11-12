import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { CalendarNavigation } from './features/calendar-view/ui/CalendarNavigation.tsx';
import { MonthView } from './features/calendar-view/ui/monthview/MonthView.tsx';
import { WeekView } from './features/calendar-view/ui/weekview/WeekView.tsx';
import { EventForm } from './features/event-form/ui/EventForm.tsx';
import { EventList } from './features/event-list/ui/EventList.tsx';
import { useEventOverlap } from './features/event-overlap/hooks/useEventOverlap.ts';
import { EventOverlapDialog } from './features/event-overlap/ui/EventOverlapDialog.tsx';
import { useNotifications } from './features/notification/hooks/useNotifications.ts';
import { NotificationList } from './features/notification/ui/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types.ts';

function App() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { events, saveEvent, fetchEvents, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );
  const { notifiedEvents, notifications, clearNotification } = useNotifications(events);

  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { filteredEvents } = useSearch(events, currentDate, view);

  const {
    isOpen: isOverlapDialogOpen,
    overlappingEvents,
    handleEventSave,
    handleDialogClose,
    handleDialogConfirm,
  } = useEventOverlap({
    events,
    onSaveSuccess: () => {
      setEditingEvent(null);
    },
    saveEvent,
    editingEvent,
  });

  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm initialEvent={editingEvent} onSubmit={handleEventSave} />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <CalendarNavigation view={view} onViewChange={setView} onNavigate={navigate} />

          {view === 'week' ? (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              holidays={holidays}
              notifiedEvents={notifiedEvents}
            />
          )}
        </VStack>

        <EventList
          notifiedEvents={notifiedEvents}
          setEditingEvent={setEditingEvent}
          events={events}
          onDelete={deleteEvent}
          fetchEvents={fetchEvents}
        />
      </Flex>

      <EventOverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
      />

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} clearNotification={clearNotification} />
      )}
    </Box>
  );
}

export default App;
