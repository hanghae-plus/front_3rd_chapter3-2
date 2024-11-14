/* eslint-disable no-unused-vars */
import { useToast } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { findOverlappingEvents } from '../../../entities/event/lib/eventUtils';
import { Event } from '../../../entities/event/model/types';
import { EventFormState } from '../../event-form/model/types';

interface UseEventOverlapProps {
  events: Event[];
  onSaveSuccess: () => void;
  saveEvent: (eventData: EventFormState | Event) => Promise<void>;
  editingEvent: Event | null;
}

class EventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventValidationError';
  }
}

export const useEventOverlap = ({
  events,
  onSaveSuccess,
  saveEvent,
  editingEvent,
}: UseEventOverlapProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingSaveEvent, setPendingSaveEvent] = useState<Event | null>(null);

  const toast = useToast();
  const showSuccessToast = useCallback(() => {
    toast({
      title: '일정이 저장되었습니다.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const showErrorToast = useCallback(
    (error: Error) => {
      toast({
        title: '일정 저장에 실패했습니다.',
        description:
          error instanceof EventValidationError ? error.message : '알 수 없는 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  const showOverlapWarningToast = useCallback(
    (overlappingEvents: Event[]) => {
      const overlappingTitles = overlappingEvents.map((event) => `"${event.title}"`).join(', ');
      toast({
        title: '일정 겹침 경고',
        description: `다음 일정과 시간이 겹칩니다: ${overlappingTitles}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    },
    [toast]
  );

  const validateEvent = useCallback(
    (eventData: Event): void => {
      // 기본 필수 필드 검증
      if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
        toast({
          title: '일정 저장에 실패했습니다.',
          description: '필수 정보를 모두 입력해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        throw new EventValidationError('필수 정보를 모두 입력해주세요.');
      }

      // 시작 시간과 종료 시간 비교
      const startTime = new Date(`${eventData.date}T${eventData.startTime}`);
      const endTime = new Date(`${eventData.date}T${eventData.endTime}`);

      if (endTime <= startTime) {
        toast({
          title: '일정 저장에 실패했습니다.',
          description: '종료 시간은 시작 시간보다 이후여야 합니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        throw new EventValidationError('종료 시간은 시작 시간보다 이후여야 합니다.');
      }

      // 반복 일정 검증
      if (eventData.isRepeating && eventData.repeat) {
        // 반복 종료일 검증
        if (eventData.repeat.endDate) {
          const startDate = new Date(eventData.date);
          const endDate = new Date(eventData.repeat.endDate);

          if (endDate < startDate) {
            toast({
              title: '일정 저장에 실패했습니다.',
              description: '반복 종료일은 시작일보다 이후여야 합니다.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            throw new EventValidationError('반복 종료일은 시작일보다 이후여야 합니다.');
          }
        }

        // 반복 간격 검증
        if (eventData.repeat.interval !== undefined) {
          if (eventData.repeat.interval < 1) {
            toast({
              title: '일정 저장에 실패했습니다.',
              description: '반복 간격은 1 이상이어야 합니다.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            throw new EventValidationError('반복 간격은 1 이상이어야 합니다.');
          }

          // 반복 유형별 최대 간격 검증
          const maxIntervals: Record<string, number> = {
            daily: 365, // 매일 반복의 경우 최대 365일
            weekly: 52, // 매주 반복의 경우 최대 52주
            monthly: 12, // 매월 반복의 경우 최대 12개월
            yearly: 10, // 매년 반복의 경우 최대 10년
          };

          const maxInterval = maxIntervals[eventData.repeat.type];
          if (maxInterval && eventData.repeat.interval > maxInterval) {
            toast({
              title: '일정 저장에 실패했습니다.',
              description: `반복 간격은 ${maxInterval} 이하여야 합니다.`,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            throw new EventValidationError(`반복 간격은 ${maxInterval} 이하여야 합니다.`);
          }
        }

        // 반복 횟수 검증
        if (eventData.repeat.endCondition === 'count') {
          const maxCount = 100; // 최대 반복 횟수 설정
          if (!eventData.repeat.count || eventData.repeat.count < 1) {
            toast({
              title: '일정 저장에 실패했습니다.',
              description: '반복 횟수는 1 이상이어야 합니다.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            throw new EventValidationError('반복 횟수는 1 이상이어야 합니다.');
          }
          if (eventData.repeat.count > maxCount) {
            toast({
              title: '일정 저장에 실패했습니다.',
              description: `반복 횟수는 ${maxCount} 이하여야 합니다.`,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            throw new EventValidationError(`반복 횟수는 ${maxCount} 이하여야 합니다.`);
          }
        }
      }
    },
    [toast]
  );

  const saveEventWithValidation = useCallback(
    async (eventData: Event): Promise<void> => {
      try {
        if (editingEvent) {
          await saveEvent({ ...editingEvent, ...eventData });
        } else {
          await saveEvent(eventData);
        }
        onSaveSuccess();
        showSuccessToast();
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.')
        );
        throw error;
      }
    },
    [editingEvent, saveEvent, onSaveSuccess, showSuccessToast, showErrorToast]
  );

  const handleEventSave = useCallback(
    async (eventData: Event) => {
      try {
        validateEvent(eventData);

        const overlapping = findOverlappingEvents(events, eventData);
        if (overlapping.length > 0) {
          setOverlappingEvents(overlapping);
          setPendingSaveEvent(eventData);
          setIsOpen(true);
          showOverlapWarningToast(overlapping);
          return;
        }

        await saveEventWithValidation(eventData);
      } catch (error) {
        if (error instanceof Error) {
          showErrorToast(error);
        }
      }
    },
    [events, validateEvent, saveEventWithValidation, showErrorToast]
  );

  const handleDialogClose = useCallback(() => {
    setIsOpen(false);
    setPendingSaveEvent(null);
    setOverlappingEvents([]);
  }, []);

  const handleDialogConfirm = useCallback(async () => {
    if (!pendingSaveEvent) return;

    try {
      await saveEventWithValidation(pendingSaveEvent);
      handleDialogClose();
    } catch (error) {
      // Error toast is already handled in saveEventWithValidation
      console.error('Failed to save event:', error);
    }
  }, [pendingSaveEvent, saveEventWithValidation, handleDialogClose]);

  return {
    isOpen,
    overlappingEvents,
    handleEventSave,
    handleDialogClose,
    handleDialogConfirm,
  };
};
