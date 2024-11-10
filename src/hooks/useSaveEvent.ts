import { useToast, UseToastOptions } from '@chakra-ui/react';
import { useCreateEvent } from '@hooks/events/useCreateEvent';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import { useUpdateEvent } from '@hooks/events/useUpdateEvent';
import { editingEventValidation } from '@services/editingEventValidation';
import useScheduleForm from '@stores/useScheduleForm';
import { findOverlappingEvents } from '@utils/eventOverlap';
import { useMemo } from 'react';

import { useDialogContext } from '@/context/useDialog';

export const useSaveEvent = () => {
  const toast = useToast();
  const { createEvent } = useCreateEvent();
  const { updateEvent } = useUpdateEvent();
  const { events } = useFetchEvents();
  const isEditing = useScheduleForm((state) => state.isEditing);
  const id = useScheduleForm((state) => state.id);
  const title = useScheduleForm((state) => state.title);
  const date = useScheduleForm((state) => state.date);
  const description = useScheduleForm((state) => state.description);
  const location = useScheduleForm((state) => state.location);
  const category = useScheduleForm((state) => state.category);
  const repeat = useScheduleForm((state) => state.repeat);
  const notificationTime = useScheduleForm((state) => state.notificationTime);

  const startTime = useScheduleForm((state) => state.startTime);
  const endTime = useScheduleForm((state) => state.endTime);
  const resetForm = useScheduleForm((state) => state.resetForm);
  const { setDialogName, setOverlapEvents } = useDialogContext();

  const memoForm = useMemo(
    () => ({
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
    }),
    [title, date, startTime, endTime, description, location, category, repeat, notificationTime]
  );

  const save = () => {
    const { valid, toastData } = editingEventValidation(memoForm);
    if (!valid) {
      toast(toastData as UseToastOptions);
      return;
    }

    const overlapping = findOverlappingEvents(memoForm, events);
    if (overlapping.length > 0) {
      setDialogName('overlappingEvents');
      setOverlapEvents(overlapping);
      return;
    }

    if (isEditing) updateSchedule();
    else createSchedule();
  };

  const createSchedule = () => {
    createEvent(memoForm);
    resetForm();
  };

  const updateSchedule = () => {
    updateEvent({ id, ...memoForm });
    resetForm();
  };

  return { save, isEditing, createSchedule, updateSchedule };
};
