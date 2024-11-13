import { Event, EventFormState, EventFormErrors } from '../model/types';

export const createInitialFormState = (initialEvent?: Event): EventFormState => ({
  // 기본 필드
  title: initialEvent?.title ?? '',
  date: initialEvent?.date ?? '',
  startTime: initialEvent?.startTime ?? '',
  endTime: initialEvent?.endTime ?? '',
  description: initialEvent?.description ?? '',
  location: initialEvent?.location ?? '',
  category: initialEvent?.category ?? '',
  isRepeating: initialEvent?.isRepeating ?? false,
  repeatDate: initialEvent?.repeatDate ?? [],

  // 반복 설정
  repeatType: initialEvent?.repeat?.type ?? 'none',
  repeatInterval: initialEvent?.repeat?.interval ?? 1,
  repeatEndDate: initialEvent?.repeat?.endDate ?? '',
  repeatEndCondition: initialEvent?.repeat?.endCondition ?? 'never',
  repeatCount: initialEvent?.repeat?.count,
  notificationTime: '1분 전',
});

export const convertFormStateToEvent = (formState: EventFormState, id?: string): Event => ({
  id: id ?? '',
  title: formState.title,
  date: formState.date,
  startTime: formState.startTime,
  endTime: formState.endTime,
  description: formState.description,
  location: formState.location,
  category: formState.category,
  isRepeating: formState.isRepeating,
  repeatDate: formState.repeatDate,
  repeat: {
    type: formState.repeatType,
    interval: formState.repeatInterval,
    endDate: formState.repeatEndDate,
    endCondition: formState.repeatEndCondition,
    count: formState.repeatCount,
  },
  notificationTime: '1분 전',
});

export const validateEventForm = (formState: EventFormState, isDirty: boolean): EventFormErrors => {
  const errors: EventFormErrors = {};

  if (!formState.title) errors.title = '제목을 입력해주세요';
  if (!formState.date) errors.date = '날짜를 선택해주세요';
  if (!formState.startTime) errors.startTime = '시작 시간을 선택해주세요';
  if (!formState.endTime) errors.endTime = '종료 시간을 선택해주세요';

  if (formState.startTime && formState.endTime) {
    const start = new Date(`${formState.date}T${formState.startTime}`);
    const end = new Date(`${formState.date}T${formState.endTime}`);
    if (start >= end) {
      errors.timeRange = '종료 시간은 시작 시간보다 늦어야 합니다';
    }
  }

  if (formState.isRepeating) {
    if (formState.repeatInterval < 1) {
      errors.repeatInterval = '반복 간격은 1 이상이어야 합니다';
    }

    if (formState.repeatEndCondition === 'date' && !formState.repeatEndDate) {
      errors.repeatEndDate = '종료 날짜를 선택해주세요';
    }

    if (formState.repeatEndCondition === 'count') {
      if (!formState.repeatCount) {
        errors.repeatCount = '반복 횟수를 입력해주세요';
      } else if (formState.repeatCount < 1) {
        errors.repeatCount = '반복 횟수는 1 이상이어야 합니다';
      }
    }

    if (formState.repeatEndDate) {
      const startDate = new Date(formState.date);
      const endDate = new Date(formState.repeatEndDate);
      if (startDate >= endDate) {
        errors.repeatDateRange = '종료 날짜는 시작 날짜보다 늦어야 합니다';
      }
    }
  }

  return errors;
};

export const getInitialFormState = (initialEvent: Event | null): EventFormState => ({
  title: initialEvent?.title || '',
  date: initialEvent?.date || '',
  startTime: initialEvent?.startTime || '',
  endTime: initialEvent?.endTime || '',
  description: initialEvent?.description || '',
  location: initialEvent?.location || '',
  category: initialEvent?.category || '',
  isRepeating: initialEvent?.isRepeating || false,
  repeatType: initialEvent?.repeat?.type || 'none',
  repeatInterval: initialEvent?.repeat?.interval || 1,
  repeatEndDate: initialEvent?.repeat?.endDate || '',
  repeatEndCondition: initialEvent?.repeat?.endCondition || 'never',
  repeatCount: initialEvent?.repeat?.count || undefined,
  notificationTime: '1분 전',
});

export const transformFormStateToEvent = (formState: EventFormState, eventId?: string): Event => ({
  id: eventId || '',
  title: formState.title,
  date: formState.date,
  startTime: formState.startTime,
  endTime: formState.endTime,
  description: formState.description,
  location: formState.location,
  category: formState.category,
  isRepeating: formState.isRepeating,
  repeat: {
    type: formState.repeatType,
    interval: formState.repeatInterval,
    endDate: formState.repeatEndDate,
    endCondition: formState.repeatEndCondition,
    count: formState.repeatCount,
  },
  notificationTime: '1분 전',
});
