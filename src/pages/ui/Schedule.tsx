import { Box, Heading } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { Event } from '../../entities/event/model/types';
import { CalendarNavigation } from '../../features/calendar-view/ui/CalendarNavigation';
import { MonthView } from '../../features/calendar-view/ui/monthview/MonthView';
import { WeekView } from '../../features/calendar-view/ui/weekview/WeekView';
import { EventForm } from '../../features/event-form/ui/EventForm';
import { EventList } from '../../features/event-list/ui/EventList';
import { useEventOverlap } from '../../features/event-overlap/hooks/useEventOverlap';
import { EventOverlapDialog } from '../../features/event-overlap/ui/EventOverlapDialog';
import { useNotifications } from '../../features/notification/hooks/useNotifications';
import { NotificationList } from '../../features/notification/ui/NotificationList';
import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useSearch } from '../../hooks/useSearch';
import { Flex } from '../../shared/ui/Flex';
import { VStack } from '../../shared/ui/Stack';

export default function Schedule() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { events, saveEvent, fetchEvents, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );
  const { notifiedEvents, notifications, clearAllNotifications } = useNotifications(events);
  console.log(editingEvent);
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
        <EventForm
          initialEvent={editingEvent}
          onSubmit={handleEventSave}
          setEditingEvent={setEditingEvent}
        />

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
        <NotificationList notifications={notifications} clearNotification={clearAllNotifications} />
      )}
    </Box>
  );
}
