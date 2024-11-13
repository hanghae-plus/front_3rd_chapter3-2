/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { getInitialFormState, validateEventForm } from '../../../entities/event/lib/eventFormUtils';
import {
  Event,
  EventFormErrors,
  EventFormState,
  NotificationTime,
  RepeatEndCondition,
  RepeatType,
} from '../../../entities/event/model/types';

interface UseEventFormReturn {
  formState: EventFormState;
  setFormState: Dispatch<SetStateAction<EventFormState>>;
  errors: EventFormErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDirty: boolean;
}

export const useEventForm = (initialEvent: Event | null): UseEventFormReturn => {
  const [formState, setFormState] = useState<EventFormState>(() =>
    getInitialFormState(initialEvent)
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateAndUpdateErrors = useCallback((newState: EventFormState) => {
    const validationErrors = validateEventForm(newState);
    setErrors(validationErrors);
  }, []);

  const updateDirtyState = useCallback((state: EventFormState) => {
    setIsDirty((prevIsDirty) => {
      if (prevIsDirty) return true;
      return Boolean(state.title && state.date && state.startTime && state.endTime);
    });
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormState((prev) => {
        const newState = {
          ...prev,
          [name]:
            name === 'notificationTime'
              ? ({
                  value: Number(value),
                  label: `${value}분 전`,
                } as NotificationTime)
              : value,
        };

        validateAndUpdateErrors(newState);
        updateDirtyState(newState);
        return newState;
      });
    },
    [validateAndUpdateErrors, updateDirtyState]
  );

  const handleCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFormState((prev) => {
        const newState = {
          ...prev,
          [name]: checked,
          ...(name === 'isRepeating' &&
            !checked && {
              repeatType: 'none' as RepeatType,
              repeatInterval: 1,
              repeatEndDate: '',
              repeatEndCondition: 'date' as RepeatEndCondition,
              repeatCount: 1,
              repeatDate: [],
            }),
        };

        validateAndUpdateErrors(newState as EventFormState);
        return newState;
      });
    },
    [validateAndUpdateErrors]
  );

  // Initial form state setup
  useEffect(() => {
    const newState = getInitialFormState(initialEvent);
    setFormState(newState);
    validateAndUpdateErrors(newState);
  }, [initialEvent, validateAndUpdateErrors]);

  // Form validation on critical field changes
  useEffect(() => {
    validateAndUpdateErrors(formState);
  }, [
    formState.date,
    formState.startTime,
    formState.endTime,
    formState.repeatEndDate,
    formState.notificationTime,
    validateAndUpdateErrors,
  ]);

  return {
    formState,
    setFormState,
    errors,
    handleInputChange,
    handleCheckboxChange,
    isDirty,
  };
};
