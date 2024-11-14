import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { findOverlappingEvents } from '@/features/event/lib/eventOverlap';
import { createEventFormData } from '@/features/event/lib/eventUtils';
import { useCalendarView } from '@/features/event/model/useCalendarView';
import { useEventForm } from '@/features/event/model/useEventForm';
import { useEventOperations } from '@/features/event/model/useEventOperations';
import { useNotifications } from '@/features/event/model/useNotifications';
import { useSearch } from '@/features/event/model/useSearch';
import { Event, EventForm } from '@/types';

type EventContextType = {
  formValues: ReturnType<typeof useEventForm> & {
    eventFormData: Event | EventForm;
  };
  operationsValues: ReturnType<typeof useEventOperations>;
  notificationsValues: ReturnType<typeof useNotifications>;
  calendarViewValues: ReturnType<typeof useCalendarView>;
  searchValues: ReturnType<typeof useSearch>;
  state: {
    isOverlapDialogOpen: boolean;
    handleCloseOverlapDialog: () => void;
    overlappingEvents: Event[];
    hasOverlapEvent: () => boolean;
  };
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const formValues = useEventForm();

  const operationsValues = useEventOperations(Boolean(formValues.editingEvent), () =>
    formValues.setEditingEvent(null)
  );

  const notificationsValues = useNotifications(operationsValues.events);
  const calendarViewValues = useCalendarView();
  const searchValues = useSearch(
    operationsValues.events,
    calendarViewValues.currentDate,
    calendarViewValues.view
  );

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const eventFormData: Event | EventForm = useMemo(() => {
    return createEventFormData({
      formState: formValues.formState,
      repeatState: formValues.repeatState,
      startTime: formValues.startTime,
      endTime: formValues.endTime,
      editingEvent: formValues.editingEvent,
    });
  }, [formValues]);

  const hasOverlapEventDialogOpen = useCallback((events: Event[]) => {
    setIsOverlapDialogOpen(true);
    setOverlappingEvents(events);
  }, []);

  const handleCloseOverlapDialog = useCallback(() => {
    setIsOverlapDialogOpen(false);
  }, []);

  const hasOverlapEvent = useCallback(() => {
    const overlapping = findOverlappingEvents(eventFormData, operationsValues.events);
    if (overlapping.length > 0) {
      hasOverlapEventDialogOpen(overlapping);
      return true;
    }
    return false;
  }, [eventFormData, operationsValues.events, hasOverlapEventDialogOpen]);

  const state = useMemo(
    () => ({
      isOverlapDialogOpen,
      handleCloseOverlapDialog,
      overlappingEvents,
      hasOverlapEvent,
    }),
    [isOverlapDialogOpen, overlappingEvents, hasOverlapEvent, handleCloseOverlapDialog]
  );

  const values = useMemo(
    () => ({
      formValues: { ...formValues, eventFormData },
      operationsValues,
      state,
      notificationsValues,
      calendarViewValues,
      searchValues,
    }),
    [
      formValues,
      operationsValues,
      state,
      notificationsValues,
      calendarViewValues,
      searchValues,
      eventFormData,
    ]
  );

  return <EventContext.Provider value={values}>{children}</EventContext.Provider>;
};

export default EventProvider;
