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
}

export const useEventForm = (initialEvent: Event | null): UseEventFormReturn => {
  const [formState, setFormState] = useState<EventFormState>(() =>
    getInitialFormState(initialEvent)
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormState((prev) => {
        const newState = {
          ...prev,
          [name]: name === 'notificationTime' ? (value as NotificationTime) : value,
        };
        const validationErrors = validateEventForm(newState, isDirty);
        setErrors(validationErrors);
        return newState;
      });

      setIsDirty((prevIsDirty) => {
        if (!prevIsDirty) {
          return formState.title && formState.date && formState.startTime && formState.endTime
            ? true
            : false;
        }
        return prevIsDirty;
      });
    },
    [isDirty] // formState 제거, 필요한 상태만 참조
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
              notificationTime: prev.notificationTime, // 알림 설정은 유지
            }),
        };
        const validationErrors = validateEventForm(newState as EventFormState, isDirty);
        setErrors(validationErrors);
        return newState;
      });
    },
    [isDirty]
  );

  useEffect(() => {
    const newState = getInitialFormState(initialEvent);
    setFormState(newState);

    const validationErrors = validateEventForm(newState, isDirty);
    setErrors(validationErrors);
  }, [initialEvent, isDirty]);

  useEffect(() => {
    const validationErrors = validateEventForm(formState, isDirty);
    setErrors(validationErrors);
  }, [
    formState.date,
    formState.startTime,
    formState.endTime,
    formState.repeatEndDate,
    formState.notificationTime,
    isDirty,
  ]);

  return {
    formState,
    setFormState,
    errors,
    handleInputChange,
    handleCheckboxChange,
  };
};
