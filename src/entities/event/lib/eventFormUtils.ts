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
  notificationTime: initialEvent?.notificationTime || { value: 1, label: '1분 전' },
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
  notificationTime: formState.notificationTime,
});

export const validateEventForm = (formState: EventFormState): EventFormErrors => {
  const errors: EventFormErrors = {};

  // 필수 필드 검증
  if (!formState.title?.trim()) {
    errors.title = '제목을 입력해주세요';
  }

  if (!formState.date) {
    errors.date = '날짜를 선택해주세요';
  }

  if (!formState.startTime) {
    errors.startTime = '시작 시간을 선택해주세요';
  }

  if (!formState.endTime) {
    errors.endTime = '종료 시간을 선택해주세요';
  }

  // 시작시간과 종료시간이 모두 있을 때만 시간 범위 검증
  if (formState.startTime && formState.endTime && formState.date) {
    const startDateTime = new Date(`${formState.date}T${formState.startTime}`);
    const endDateTime = new Date(`${formState.date}T${formState.endTime}`);

    if (endDateTime <= startDateTime) {
      errors.timeRange = '종료 시간은 시작 시간보다 늦어야 합니다';
    }
  }

  // 반복 일정 관련 검증
  if (formState.isRepeating) {
    if (formState.repeatEndCondition === 'date' && !formState.repeatEndDate) {
      errors.repeatEndDate = '종료 날짜를 선택해주세요';
    }

    if (
      formState.repeatEndCondition === 'count' &&
      (!formState.repeatCount || formState.repeatCount <= 0)
    ) {
      errors.repeatCount = '유효한 반복 횟수를 입력해주세요';
    }

    if (formState.repeatEndCondition === 'date' && formState.repeatEndDate) {
      const startDate = new Date(formState.date);
      const endDate = new Date(formState.repeatEndDate);

      if (endDate <= startDate) {
        errors.repeatDateRange = '반복 종료일은 시작일보다 늦어야 합니다';
      }
    }

    if (formState.repeatInterval <= 0) {
      errors.repeatInterval = '반복 간격은 1 이상이어야 합니다';
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
  repeatType: initialEvent?.repeat?.type || 'daily',
  repeatInterval: initialEvent?.repeat?.interval || 1,
  repeatEndDate: initialEvent?.repeat?.endDate || '',
  repeatEndCondition: initialEvent?.repeat?.endCondition || 'never',
  repeatCount: initialEvent?.repeat?.count || undefined,
  notificationTime: initialEvent?.notificationTime || { value: 1, label: '1분 전' },
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
  notificationTime: formState.notificationTime,
});
