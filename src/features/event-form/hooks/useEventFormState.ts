import { useState } from 'react';

import { Event } from '../../../entities/event/model/types';
import { EventFormState } from '../model/types';

export const useEventFormState = (initialEvent?: Event) => {
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
    repeatEndCondition: initialEvent?.repeat.endCondition || 'never',
    repeatCount: initialEvent?.repeat.count,
    notificationTime: initialEvent?.notificationTime || { value: 0, label: '0분 전' },
  });

  const updateFormField = <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    formState,
    updateFormField,
  };
};
