import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';
import React from 'react';

import CalendarMonthView from './CalendarMonthView';
import CalendarWeekView from './CalendarWeekView';
import { Event } from '../../types';

interface CalendarViewProps {
  events: Event[];
  // eslint-disable-next-line
  navigate: (direction: 'prev' | 'next') => void;
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  currentDate: Date;
  holidays: { [key: string]: string };
  notifiedEvents: string[];
  filteredEvents: Event[];
  resetForm: () => void;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const CalendarView = ({
  events,
  navigate,
  view,
  setView,
  currentDate,
  notifiedEvents,
  filteredEvents,
  holidays,
  resetForm,
  setSearchTerm,
}: CalendarViewProps) => {
  function handleViewChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setView(e.target.value as 'week' | 'month');
    resetForm();
    setSearchTerm('');
  }

  function handleNavigateChange(btnType: string) {
    navigate(btnType as 'prev' | 'next');
    resetForm();
    setSearchTerm('');
  }

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => handleNavigateChange('prev')}
        />
        <Select aria-label="view" value={view} onChange={handleViewChange}>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>

        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => handleNavigateChange('next')}
        />
      </HStack>

      {view === 'week' && (
        <CalendarWeekView
          currentDate={currentDate}
          events={events}
          view={view}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <CalendarMonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};

export default CalendarView;
