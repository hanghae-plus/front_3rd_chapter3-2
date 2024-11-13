import { Alert, AlertIcon } from '@chakra-ui/react';

import { handleRepeatDateLogic } from '../../../entities/event/lib/eventUtils';
import { RepeatType } from '../../../entities/event/model/types';

interface RepeatDateMessageProps {
  date: string;
  repeatType: RepeatType;
}

const RepeatDateMessage = ({ date, repeatType }: RepeatDateMessageProps) => {
  const repeatLogic = handleRepeatDateLogic(date, repeatType);

  if (!repeatLogic) return null;

  const { isLastDayOfMonth, isFebruaryLeapDay } = repeatLogic;

  if (repeatType === 'monthly' && (isLastDayOfMonth || isFebruaryLeapDay)) {
    return (
      <Alert status="warning" size="sm" mt={1} borderRadius="md">
        <AlertIcon />
        {isLastDayOfMonth ? '매월 말일에 반복됩니다.' : '윤년이 아닌 경우 2월 28일에 반복됩니다.'}
      </Alert>
    );
  }

  return null;
};

export default RepeatDateMessage;
