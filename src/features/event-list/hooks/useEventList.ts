import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Event } from '../../../entities/event/model/types';
import { useEventOperations } from '../../../hooks/useEventOperations';

interface UseEventListProps {
  editingEvent: Event | null;
  setEditingEvent: Dispatch<SetStateAction<Event | null>>;
}

export const useEventList = ({ editingEvent, setEditingEvent }: UseEventListProps) => {
  // 로컬 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[] | null>(null);

  // 이벤트 CRUD 작업을 위한 hook
  const { fetchEvents, events, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  // 컴포넌트 마운트 시 이벤트 목록 가져오기
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 검색어 변경 시 이벤트 필터링
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (!searchValue) {
      setFilteredEvents(null);
      return;
    }

    const filtered = events.filter((event) => {
      const searchFields = [event.title, event.description, event.location, event.category].map(
        (field) => field?.toLowerCase() || ''
      );

      return searchFields.some((field) => field.includes(searchValue));
    });

    setFilteredEvents(filtered);
  };

  // 이벤트 수정
  const handleEdit = (event: Event) => {
    if (!event?.id) {
      console.error('Invalid event data:', event);
      return;
    }
    setEditingEvent(event);
  };

  // 이벤트 삭제
  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      // 삭제 후 필터링된 결과 업데이트
      if (filteredEvents) {
        setFilteredEvents((prev) => prev?.filter((event) => event.id !== id) || null);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  return {
    searchTerm,
    filteredEvents: filteredEvents || events,
    handleSearch,
    handleEdit,
    handleDelete,
    fetchEvents,
  };
};
