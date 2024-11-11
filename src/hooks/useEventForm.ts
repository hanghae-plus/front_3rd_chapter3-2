import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

import { validateTime } from '../features/event-form/lib/validation';
import { EventFormState, FormErrors } from '../features/event-form/model/types';
import { Event } from '../types';

interface UseEventFormReturn {
  formState: EventFormState;
  errors: FormErrors;
  editingEvent: Event | null;
  setEditingEvent: Dispatch<SetStateAction<Event | null>>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
}

export const useEventForm = (initialEvent: Event | null): UseEventFormReturn => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(initialEvent);

  const [formState, setFormState] = useState<EventFormState>({
    title: initialEvent?.title || '',
    date: initialEvent?.date || '',
    startTime: initialEvent?.startTime || '',
    endTime: initialEvent?.endTime || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    category: initialEvent?.category || '',
    isRepeating: initialEvent?.repeat.type !== 'none',
    repeatType: initialEvent?.repeat.type || 'none',
    repeatInterval: initialEvent?.repeat.interval || 1,
    repeatEndDate: initialEvent?.repeat.endDate || '',
    notificationTime: initialEvent?.notificationTime || 10,
  });

  const [errors, setErrors] = useState<FormErrors>({
    startTime: null,
    endTime: null,
  });

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormState((prev) => {
      const newState = { ...prev, [name]: value };

      if (name === 'startTime' || name === 'endTime') {
        const startTime = name === 'startTime' ? value : prev.startTime;
        const endTime = name === 'endTime' ? value : prev.endTime;
        setErrors(validateTime(startTime, endTime));
      }

      return newState;
    });
  }, []);

  const handleCheckboxChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formState.title || !formState.date || !formState.startTime || !formState.endTime) {
      return;
    }

    const timeErrors = validateTime(formState.startTime, formState.endTime);
    if (timeErrors.startTime || timeErrors.endTime) {
      setErrors(timeErrors);
      return;
    }

    // TODO: 폼 제출 로직
  }, [formState]);

  return {
    formState,
    errors,
    editingEvent,
    setEditingEvent,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
  };
};
