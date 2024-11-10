import { Dispatch, SetStateAction, useState } from 'react';

import { Event, EventForm } from '../types';

interface UseEditingEventProps {
  setEventForm: Dispatch<SetStateAction<EventForm>>;
  setIsRepeating: Dispatch<SetStateAction<boolean>>;
}

export const useEditingEvent = ({ setEventForm, setIsRepeating }: UseEditingEventProps) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const editEvent = (event: Event) => {
    setEventForm(event);
    setEditingEvent(event);
    setIsRepeating(event.repeat.type !== 'none');
  };

  return { editingEvent, setEditingEvent, editEvent };
};
