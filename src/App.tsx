import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import EventList from './components/EventList';
import MonthView from './components/MonthView';
import NotificationList from './components/NotificationList';
import OverlapAlertDialog from './components/OverlapAlertDialog';
import RepeatEventModal from './components/RepeatEventModal';
import WeekView from './components/WeekView';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useDeleteAllEvents } from './hooks/useDeleteAllEvents.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';
import { getTimeErrorMessage } from './utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const getIntervalLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

const renderRepeatIcon = (event: Event) => {
  if (event.repeat.type !== 'none') {
    return (
      <Tooltip
        label={`${event.repeat.interval}${getIntervalLabel(event.repeat.type)}반복${
          event.repeat.endDate ? `${event.repeat.endDate} 까지` : ''
        }`}
      >
        <RepeatIcon color="red.500" />
      </Tooltip>
    );
  }
  return null;
};

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();
  const { events, saveEvent, deleteEvent, saveRepeatEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { deleteAllEvents, isDeleting } = useDeleteAllEvents(resetForm, setEditingEvent);

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: EventForm | Event = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? {
            type: 'none',
            interval: 0,
          }
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    if (isRepeating && !editingEvent) {
      await saveRepeatEvents(eventData);
      resetForm();
    } else {
      const overlapping = findOverlappingEvents(eventData, events);
      if (overlapping.length > 0) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
      } else {
        await saveEvent(eventData);
        resetForm();
      }
    }
  };

  // const deleteAllEvents = async () => {
  //   try {
  //     // 모든 이벤트의 ID를 가져오기 위해 먼저 이벤트를 가져옵니다.
  //     const response = await fetch('http://localhost:3000/api/events');
  //     if (!response.ok) {
  //       throw new Error('이벤트를 가져오는 데 실패했습니다.');
  //     }
  //     const { events } = await response.json();
  //     const eventIds = events.map((event: { id: string }) => event.id);

  //     // 모든 이벤트 ID를 사용하여 삭제 요청을 보냅니다.
  //     const deleteResponse = await fetch('http://localhost:3000/api/events-list', {
  //       method: 'DELETE',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ eventIds }),
  //     });

  //     if (deleteResponse.ok) {
  //       toast({
  //         title: '모든 일정이 삭제되었습니다.',
  //         status: 'success',
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //       // 모든 일정을 삭제한 후, 상태를 초기화하거나 새로고침
  //       setEditingEvent(null);
  //       resetForm();
  //     } else {
  //       throw new Error('삭제 실패');
  //     }
  //   } catch (error) {
  //     toast({
  //       title: '일정 삭제 중 오류가 발생했습니다.',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleRepeatIconClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <VStack w="400px" spacing={5} align="stretch">
          <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>
          <FormControl>
            <FormLabel>제목</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>날짜</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>시작 시간</FormLabel>
              <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
                <Input
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl>
              <FormLabel>종료 시간</FormLabel>
              <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
                <Input
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </HStack>
          <FormControl>
            <FormLabel>설명</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>위치</FormLabel>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>카테고리</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>반복 설정</FormLabel>
            <Checkbox
              isChecked={isRepeating}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsRepeating(checked);
                if (checked) {
                  setRepeatType('daily');
                } else {
                  setRepeatType('none');
                }
              }}
            >
              반복 일정
            </Checkbox>
          </FormControl>
          <FormControl>
            <FormLabel>알림 설정</FormLabel>
            <Select
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {notificationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <VStack width="100%">
            <FormControl>
              <FormLabel>반복 유형</FormLabel>
              <Select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>
            <HStack width="100%">
              <FormControl>
                <FormLabel>반복 간격</FormLabel>
                <Input
                  type="number"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormControl>
                <FormLabel>반복 종료일</FormLabel>
                <Input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                />
              </FormControl>
            </HStack>
          </VStack>
          <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
          <Button onClick={deleteAllEvents} colorScheme="red" isLoading={isDeleting}>
            모든 일정 삭제
          </Button>
        </VStack>

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <HStack mx="auto" justifyContent="space-between">
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate('prev')}
            />
            <Select
              aria-label="view"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon />}
              onClick={() => navigate('next')}
            />
          </HStack>

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              weekDays={weekDays}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              renderRepeatIcon={renderRepeatIcon}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              weekDays={weekDays}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
              renderRepeatIcon={renderRepeatIcon}
            />
          )}
        </VStack>

        <EventList
          events={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifiedEvents={notifiedEvents}
          notificationOptions={[
            { value: 1, label: '1분 전' },
            { value: 10, label: '10분 전' },
            { value: 60, label: '1시간 전' },
          ]}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          onRepeatIconClick={handleRepeatIconClick}
        />
      </Flex>

      <OverlapAlertDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: editingEvent ? editingEvent.id : undefined,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            repeat: {
              type: isRepeating ? repeatType : 'none',
              interval: repeatInterval,
              endDate: repeatEndDate || undefined,
            },
            notificationTime,
          });
        }}
        cancelRef={cancelRef}
      />

      <NotificationList
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />

      <RepeatEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
}

export default App;
