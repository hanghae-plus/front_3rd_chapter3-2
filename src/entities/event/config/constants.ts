export const REPEAT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  NONE: 'none',
} as const;

export const REPEAT_TYPE_LABELS = {
  [REPEAT_TYPES.DAILY]: '매일',
  [REPEAT_TYPES.WEEKLY]: '매주',
  [REPEAT_TYPES.MONTHLY]: '매월',
  [REPEAT_TYPES.YEARLY]: '매년',
  [REPEAT_TYPES.NONE]: '반복 없음',
} as const;

export const REPEAT_END_CONDITIONS = {
  DATE: 'date',
  COUNT: 'count',
  NEVER: 'never',
} as const;

export const MAX_REPEAT_COUNT = 99;
export const MAX_REPEAT_END_DATE = '2025-06-30';
