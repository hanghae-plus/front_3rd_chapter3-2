import React, { useCallback, useEffect, useState } from 'react';

import { RepeatType } from '../../../entities/event/model/types';
import { FormErrors } from '../model/validation';

type EventFormState = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
};

const useEventForm = (initialEvent: EventFormState, onSubmit: (event: EventFormState) => void) => {
  const [formState, setFormstate] = useState(initialEvent);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormstate({ ...formState, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormstate({ ...formState, [name]: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  const validate = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!formState?.startTime) {
      newErrors.startTime = '시작 시간을 입력해주세요.';
    }

    if (!formState?.endTime) {
      newErrors.endTime = '종료 시간을 입력해주세요.';
    }

    setErrors(newErrors);
  }, [formState]);

  useEffect(() => {
    validate();
  }, [formState]);

  return {
    formState,
    errors,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
  };
};

export default useEventForm;
