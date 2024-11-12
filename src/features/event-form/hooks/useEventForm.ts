import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { Event } from '../../../entities/event/model/types';
import { validateTime } from '../lib/validation';
import { EventFormState, FormErrors } from '../model/types';

interface UseEventFormReturn {
  formState: EventFormState;
  setFormState: Dispatch<SetStateAction<EventFormState>>;
  errors: FormErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const getInitialFormState = (initialEvent: Event | null): EventFormState => ({
  title: initialEvent?.title || '',
  date: initialEvent?.date || '',
  startTime: initialEvent?.startTime || '',
  endTime: initialEvent?.endTime || '',
  description: initialEvent?.description || '',
  location: initialEvent?.location || '',
  category: initialEvent?.category || '',
  isRepeating: initialEvent?.repeat?.type !== 'none',
  repeatType: initialEvent?.repeat?.type || 'daily',
  repeatInterval: initialEvent?.repeat?.interval || 1,
  repeatEndDate: initialEvent?.repeat?.endDate || '',
  repeatEndCondition: initialEvent?.repeatEndCondition || 'date',
  notificationTime: initialEvent?.notificationTime || 10,
});

export const useEventForm = (initialEvent: Event | null): UseEventFormReturn => {
  const [formState, setFormState] = useState<EventFormState>(() =>
    getInitialFormState(initialEvent)
  );
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

  useEffect(() => {
    setFormState(getInitialFormState(initialEvent));
  }, [initialEvent]);

  return {
    formState,
    setFormState,
    errors,
    handleInputChange,
    handleCheckboxChange,
  };
};
