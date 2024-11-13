// repeatEvent를 date, interval에 맞게 추출해내는 로직을 만들어야함.

import { Event } from '../../types';
import { getRepeatingEvent } from '../../utils/repeatEventUtils';

describe('getRepeatingEvent', () => {
  it('repeat.type이 none이 아닌 경우에만 반환한다.', () => {});

  it('repeat.eventDate속성이 없을 경우, 반환값의 date는 2025-06-30을 넘기지 않는다.', () => {});

  it('매월 31, 30일 등에 등록할 경우 그 날짜가 없을때 그 월의 말일에 등록한다.', () => {});
});
