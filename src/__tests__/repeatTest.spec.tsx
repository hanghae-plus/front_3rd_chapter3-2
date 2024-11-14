/*
  1. **(필수) 반복 유형 선택**
      - 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
      - 반복 유형은 다음과 같다: 매일, 매주, 매월, 매년
          - 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
  2. **(필수) 반복 간격 설정**
      - 각 반복 유형에 대해 간격을 설정할 수 있다.
      - 예: 2일마다, 3주마다, 2개월마다 등
  3. **(필수) 반복 일정 표시**
      - 캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다.
          - 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
  4. **(필수) 반복 종료**
      - 반복 종료 조건을 지정할 수 있다.
      - 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  5. **(필수) 반복 일정 단일 수정**
      - 반복일정을 수정하면 단일 일정으로 변경됩니다.
      - 반복일정 아이콘도 사라집니다.
  6. **(필수)**  **반복 일정 단일 삭제**
      - 반복일정을 삭제하면 해당 일정만 삭제합니다.
**/

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

import App from '../App';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});

describe('반복 유형 선택', () => {
  it('반복 일정 클릭 시 하위 메뉴가 출력된다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기 체크 여부 확인
    // 쿼링의 세가지 방법 : getByRole, getByText, getByTestId
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 02. 체크 -> 없는 거 확인
    await user.click(checkbox);
    // 반복 유형, 반복 간격, 반복 종료일 없는 지 테스트
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();

    // 03. 체크 -> 있는 거 확인
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 유형이 올바르게 렌더링 되어야 한다.', () => {
    setup(<App />);

    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    const repeatType = screen.getByLabelText('반복 유형');
    expect(repeatType).toBeInTheDocument();
    expect(repeatType).toHaveTextContent('매일');
    expect(repeatType).toHaveTextContent('매주');
    expect(repeatType).toHaveTextContent('매월');
    expect(repeatType).toHaveTextContent('매년');
  });

  it('윤년 2월 29일 설정이 올바르게 처리된다.', async () => {
    vi.setSystemTime(new Date(2024, 1, 29)); // 윤년 2월 29일
    const { user } = setup(<App />);

    // 현재 날짜가 윤년인 2024년인지 확인
    const currentYear = new Date().getFullYear();
    expect(currentYear % 4).toBe(0); // 윤년 여부 확인
    expect(currentYear).toBe(2024);

    // 2월 29일이 존재하는지 확인
    const feb29th = await screen.findByText('29');
    expect(feb29th).toBeInTheDocument(); // 2월 29일이 화면에 표시되어야 함

    // 매월 반복 설정 시 2월 29일이 처리되는 방식 확인
    const repeatType = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatType, ['monthly']);

    // 매월 반복 간격을 1로 설정
    const repeatInterval = screen.getByLabelText('반복 간격');
    await user.clear(repeatInterval);
    await user.type(repeatInterval, '1');

    // 이벤트 추가를 트리거하여 날짜가 조정되는지 확인
    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    // 비윤년인 2025년 2월 28일로 시스템 시간을 변경하여 이벤트가 조정되는지 확인
    vi.setSystemTime(new Date(2025, 1, 28)); // 비윤년으로 변경
    const repeatYearly = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatYearly, ['yearly']);

    expect(screen.queryByText('28')).toBeInTheDocument(); // 2월 29일이 아닌 28일로 변경된 것 확인
  });
});

describe('반복 간격 설정', () => {
  it('각 반복 유형에 대해 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);

    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 매월 반복 설정 시 2월 29일이 처리되는 방식 확인
    const repeatType = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatType, ['daily']);

    // 매월 반복 간격을 1로 설정
    const repeatInterval = screen.getByLabelText('반복 간격');
    await user.clear(repeatInterval);
    await user.type(repeatInterval, '2');

    expect(repeatInterval).toHaveValue(2);
  });
});

describe('반복 일정 표시', () => {
  // 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
  it('캘린더 뷰에서 반복 일정을 시각적(태그)으로 구분하여 표시한다.', async () => {
    const { user } = setup(<App />);

    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    await user.click(checkbox);

    const repeatType = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatType, ['weekly']);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const repeatTag = screen.getByTestId('repeat-tag');
      expect(repeatTag).toBeInTheDocument();
      expect(repeatTag).toHaveTextContent('반복: 1주마다');
    });
  });
});

describe('반복 종료', () => {
  // 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  it('반복 종료 조건을 지정할 수 있다.', async () => {
    const { user } = setup(<App />);

    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    await user.click(checkbox);

    const repeatEndDate = screen.getByLabelText('반복 종료일');
    await user.type(repeatEndDate, '2025-06-30');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/종료: 2025-06-30/)).toBeInTheDocument();
    });
  });
});

describe('반복 일정 단일 수정', () => {
  it('반복일정을 수정하면 단일 일정으로 변경됩니다.', async () => {
    const { user } = setup(<App />);

    const eventToEdit = screen.getByText(/반복 일정/);
    await user.click(eventToEdit);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 일정');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('수정된 일정')).toBeInTheDocument();
      expect(screen.queryByTestId('repeat-tag')).not.toBeInTheDocument();
    });
  });

  it('반복일정 태그도 사라집니다.', async () => {
    const { user } = setup(<App />);

    const eventToEdit = screen.getByText(/반복 일정/);
    await user.click(eventToEdit);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 일정');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      const eventBox = screen.getByText('수정된 일정').closest('div');
      expect(eventBox).not.toContainElement(screen.queryByTestId('repeat-tag'));
    });
  });
});

describe('반복 일정 단일 삭제', () => {
  it('반복일정을 삭제하면 해당 일정만 삭제합니다.', async () => {
    const { user } = setup(<App />);

    const eventToDelete = screen.getByText(/반복 일정/);
    await user.click(eventToDelete);

    const deleteButton = screen.getByLabelText('Delete event');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/반복 일정/)).not.toBeInTheDocument();
    });
  });
});
