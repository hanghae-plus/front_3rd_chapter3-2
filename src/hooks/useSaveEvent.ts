import { useToast, UseToastOptions } from '@chakra-ui/react';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import useScheduleForm from '@stores/useScheduleForm';
import { findOverlappingEvents } from '@utils/eventOverlap';
import { useMemo } from 'react';

import { useEventOperations } from './useEventOperations';

import { useDialogContext } from '@/context/useDialog';
import { eventFormValidation } from '@/services/eventValidation';
import { Event } from '@/types';

export const useSaveEvent = () => {
  const toast = useToast();
  const { create, update, deleted } = useEventOperations();

  const { events } = useFetchEvents();

  const isEditing = useScheduleForm((state) => state.isEditing);
  const isRecurring = useScheduleForm((state) => state.isRecurring);
  const setIsRecurring = useScheduleForm((state) => state.setIsRecurring);
  const id = useScheduleForm((state) => state.id);
  const title = useScheduleForm((state) => state.title);
  const date = useScheduleForm((state) => state.date);
  const description = useScheduleForm((state) => state.description);
  const location = useScheduleForm((state) => state.location);
  const category = useScheduleForm((state) => state.category);
  const repeat = useScheduleForm((state) => state.repeat);
  const notificationTime = useScheduleForm((state) => state.notificationTime);
  const exceptionList = useScheduleForm((state) => state.exceptionList);

  const startTime = useScheduleForm((state) => state.startTime);
  const endTime = useScheduleForm((state) => state.endTime);
  const resetForm = useScheduleForm((state) => state.resetForm);
  const { setDialogName, setOverlapEvents } = useDialogContext();

  const isRepeat = useMemo(() => {
    const targetEvent = events.find((event: Event) => event.id === id);
    if (targetEvent) return targetEvent.repeat.type !== 'none';
    else return false;
  }, [events, id]);

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
      exceptionList,
    }),
    [
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
      exceptionList,
    ]
  );

  // validate 통과하면 save
  const saveWithValidation = () => {
    setIsRecurring(false);
    const valid = isValidation() && isOverlappingValid();
    if (!valid) return;

    save();
  };

  const save = () => (isEditing ? updateSchedule() : createSchedule());

  // validate 통과하면 일정 분할 저장 실행
  const splitRecurringEventWithValidation = () => {
    setIsRecurring(true);
    const valid = isValidation() && isOverlappingValid();
    if (!valid) return;

    splitRecurringEvent();
  };

  // 일정 분할 저장
  const splitRecurringEvent = async () => {
    // 새 일정 생성
    await create.createEvent(memoForm);
    // 기존 일정에서 해당 날짜 제외
    await updateEventExceptionList();
    resetForm();
  };

  // 일정 삭제 / 반복 일정 분할 삭제
  const splitEventRemove = async () => {
    if (memoForm.repeat.type === 'none') return await deleteEventSchedule();
    await updateEventExceptionList();
    resetForm();
  };

  // 반복 일정 분할 삭제
  const updateEventExceptionList = async () => {
    const updatedEvent = events.find((event: Event) => event.id === id);
    if (!updatedEvent) return;
    const updatedExceptionList: string[] = [...updatedEvent.exceptionList, memoForm.date];

    await update.updateEvent({ id, ...updatedEvent, exceptionList: updatedExceptionList });
  };

  // 인풋 validate
  const isValidation = () => {
    const { valid, toastData } = eventFormValidation(memoForm);
    if (!valid) toast(toastData as UseToastOptions);
    return valid;
  };

  // 겹치는 일정 validate
  const isOverlappingValid = () => {
    const overlapping = findOverlappingEvents(memoForm, events);
    if (overlapping.length > 0) {
      setDialogName('overlappingEvents');
      setOverlapEvents(overlapping);
    }
    return overlapping.length === 0;
  };

  // 일정 생성
  const createSchedule = async () => {
    await create.createEvent(memoForm);
    resetForm();
  };

  // 일정 삭제
  const deleteEventSchedule = async () => {
    await deleted.deleteEvent(id);
    resetForm();
  };

  // 일정 편집
  const updateSchedule = async () => {
    await update.updateEvent({ id, ...memoForm });
    resetForm();
  };

  return {
    save,
    saveWithValidation,
    splitRecurringEvent,
    splitRecurringEventWithValidation,
    splitEventRemove,
    isEditing,
    isRecurring,
    createSchedule,
    updateSchedule,
    deleteEventSchedule,
    resetForm,
    isRepeat,
  };
};
