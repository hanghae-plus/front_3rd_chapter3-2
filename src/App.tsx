import { Box, Flex, FormControl, FormLabel, Heading, Input, Text, VStack } from '@chakra-ui/react';

import { EventCard } from './components/EventCard.tsx';
import { EventHandleForm } from './components/EventHandleForm.tsx';
import { EventHandleNavigate } from './components/EventHandleNavigate.tsx';
import { MonthView } from './components/MonthView.tsx';
import { NotificationAlert } from './components/NotificationAlert.tsx';
import { WeekView } from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEditingEvent } from './hooks/useEditingEvent.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const eventFormState = useEventForm();
  const { editingEvent, editEvent, setEditingEvent } = useEditingEvent({
    setEventForm: eventFormState.setEventForm,
    setIsRepeating: eventFormState.setIsRepeating,
  });
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventHandleForm
          events={events}
          saveEvent={saveEvent}
          editingEvent={editingEvent}
          eventFormState={eventFormState}
        />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <EventHandleNavigate view={view} setView={setView} navigate={navigate} />

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              holidays={holidays}
              notifiedEvents={notifiedEvents}
            />
          )}
        </VStack>

        <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
          <FormControl>
            <FormLabel>일정 검색</FormLabel>
            <Input
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Text>검색 결과가 없습니다.</Text>
          ) : (
            filteredEvents.map((event) => (
              <EventCard
                event={event}
                notifiedEvents={notifiedEvents}
                notificationOptions={notificationOptions}
                editEvent={editEvent}
                deleteEvent={deleteEvent}
                key={event.id}
              />
            ))
          )}
        </VStack>
      </Flex>

      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <NotificationAlert
              notification={notification}
              setNotifications={setNotifications}
              index={index}
              key={notification.id}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default App;
