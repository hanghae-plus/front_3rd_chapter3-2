import { test, expect } from '@playwright/test';

test.describe.serial('캘린더 E2E 테스트', () => {
  test.describe('1. 캘린더 화면에 진입하면 관련 UI가 올바르게 노출되는지 확인', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('반복 일정 토글 기능', async ({ page }) => {
      await expect(page.getByLabel(/반복 유형/)).not.toBeVisible();
      await expect(page.getByLabel(/반복 간격/)).not.toBeVisible();
      await expect(page.getByLabel(/반복 종료일/)).not.toBeVisible();

      await page.getByText('반복 일정').click();
      await expect(page.getByLabel(/반복 유형/)).toBeVisible();
      await expect(page.getByLabel(/반복 간격/)).toBeVisible();
      await expect(page.getByLabel(/반복 종료일/)).toBeVisible();
    });

    test('반복 유형 옵션 확인', async ({ page }) => {
      await page.getByText('반복 일정').click();
      await expect(page.getByTestId('repeatType')).toContainText('매일매주매월매년');
    });

    test('매월/매년 마지막 날 옵션 확인', async ({ page }) => {
      await page.getByText('반복 일정').click();

      await page.getByLabel(/반복 유형/).selectOption('monthly');
      await page.getByLabel('날짜').fill('2024-11-30');

      await page.getByTestId('repeatType').selectOption('monthly');
      const monthlyOptions = await page.getByTestId('repeatDepth').getByRole('option').all();
      await expect(monthlyOptions[0]).toHaveText('매월 30일');
      await expect(monthlyOptions[1]).toHaveText('매월 마지막 날');

      await page.getByLabel(/반복 유형/).selectOption('yearly');
      const yearlyOptions = await page.getByTestId('repeatDepth').getByRole('option').all();
      await expect(yearlyOptions[0]).toHaveText('매년 30일');
      await expect(yearlyOptions[1]).toHaveText('매월 마지막 날');
    });
  });

  test.describe('2. 캘린더에 반복일정을 등록할때 올바른 유효성 검사가 되어야 한다.', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });
    test('필수 정보를 입력하지 않으면 오류 메시지가 표시된다.', async ({ page }) => {
      await page.getByLabel(/제목/).fill('');
      await page.getByLabel(/날짜/).fill('2024-11-03');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('테스트 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');
      await page.getByTestId('event-submit-button').click();
      await expect(page.getByText('필수 정보를 모두 입력해주세요')).toBeVisible();
    });

    test('반복 간격이 0보다 작으면 오류 메시지가 표시된다.', async ({ page }) => {
      await page.getByLabel(/제목/).fill('테스트 일정');
      await page.getByLabel(/날짜/).fill('2024-11-03');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('테스트 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel('반복 간격').fill('0');
      await page.getByLabel(/반복 종료일/).fill('2024-11-05');

      await page.getByTestId('event-submit-button').click();
      await expect(page.getByText('반복 간격은 0보다 커야 합니다.')).toBeVisible();
    });

    test('반복 종료일이 시작일 보다 이전이면 오류 메시지가 표시된다.', async ({ page }) => {
      await page.getByLabel(/제목/).fill('테스트 일정');
      await page.getByLabel(/날짜/).fill('2024-11-03');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('테스트 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel('반복 간격').fill('1');
      await page.getByLabel(/반복 종료일/).fill('2024-11-01');
      await page.getByTestId('event-submit-button').click();
      await expect(page.getByText('반복 종료일은 시작일 보다 이후여야 합니다.')).toBeVisible();
    });
  });

  test.describe('3. 캘린더 반복일정을 등록,수정,삭제 할 수 있다.', () => {
    test.beforeEach(async ({ page }) => {
      await page.clock.setFixedTime(new Date('2024-11-01T10:00:00'));
      await page.goto('/');
    });

    test('반복 일정을 종료일기준으로 생성 할 수 있다.', async ({ page }) => {
      if (await page.getByRole('button', { name: '초기화' }).isVisible()) {
        await page.getByRole('button', { name: '초기화' }).click();
      }

      await page.getByLabel(/제목/).fill('스프린트 회의');
      await page.getByLabel(/날짜/).fill('2024-11-03');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('스프린트 회의 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('daily');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2024-11-04');

      await page.getByTestId('event-submit-button').click();

      await page.waitForSelector('[data-testid="month-view"]');

      await expect(page.getByText('일정이 추가되었습니다.')).toBeVisible();

      const sprintMeetings = page.getByTestId('month-view').getByText('스프린트 회의');
      await expect(sprintMeetings).toHaveCount(2);
    });

    test('반복 일정을 개별적으로 수정할 수 있다.', async ({ page }) => {
      await page.waitForSelector('[data-testid="month-view"]');
      await expect(page.getByTestId('month-view').getByText('스프린트 회의').first()).toBeVisible();

      await page.getByTestId('event-list').getByLabel('Edit event').first().click();

      await page.getByLabel('제목').fill('팀점심');
      await page.locator('html').click();
      await page.getByTestId('event-submit-button').click();

      await expect(page.getByText('일정이 수정되었습니다.')).toBeVisible();

      await expect(page.getByTestId('month-view').getByText('팀점심')).toBeVisible();
    });

    test('반복 일정을 삭제할 수 있다.', async ({ page }) => {
      await page.getByTestId('event-list').getByLabel('Delete event').first().click();
      await expect(page.getByText('일정이 삭제되었습니다.')).toBeVisible();
      await expect(page.getByTestId('month-view').getByText('팀점심')).not.toBeVisible();

      await page.getByTestId('event-list').getByLabel('Delete event').first().click();
      await expect(page.getByText('일정이 삭제되었습니다.')).toBeVisible();
      await expect(page.getByTestId('month-view').getByText('스프린트 회의')).not.toBeVisible();
    });

    test('초기화 버튼을 누르면 일정이 초기화 된다.', async ({ page }) => {
      await expect(page.getByRole('button', { name: '초기화' })).not.toBeVisible();

      await page.getByLabel(/제목/).fill('스프린트 회의');
      await page.getByLabel(/날짜/).fill('2024-11-03');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('스프린트 회의 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('daily');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2024-11-04');

      await page.getByTestId('event-submit-button').click();

      await expect(page.getByRole('button', { name: '초기화' })).toBeVisible();

      await page.getByRole('button', { name: '초기화' }).click();

      await page.waitForSelector('[data-testid="event-list"]');

      await expect(page.getByText('모든 일정을 삭제했습니다.')).toBeVisible();

      await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
    });
  });

  test.describe('4. 반복 일정 등록시 매월 마지막날, 매월 동일한날 등록 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test.afterEach(async ({ page }) => {
      if (await page.getByRole('button', { name: '초기화' }).isVisible()) {
        await page.getByRole('button', { name: '초기화' }).click();
      }
    });

    test('매월 마지막날 등록 테스트', async ({ page }) => {
      await page.getByLabel(/제목/).fill('월간 보고');
      await page.getByLabel(/날짜/).fill('2024-11-30');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('매월 마지막날 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('monthly');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2025-04-01');
      await page.getByLabel(/마지막 날 설정/).selectOption('매월 마지막 날');

      await page.getByTestId('event-submit-button').click();

      await expect(page.getByText('일정이 추가되었습니다.')).toBeVisible();

      await expect(page.getByTestId('event-list').getByText('월간 보고').first()).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2024-11-30').first()).toBeVisible();

      await page.getByLabel('Next').click();

      await expect(page.getByTestId('event-list').getByText('월간 보고').first()).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2024-12-31').first()).toBeVisible();

      await page.getByLabel('Next').click();

      await expect(page.getByTestId('event-list').getByText('월간 보고').first()).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2025-01-31').first()).toBeVisible();
    });

    test('매월 동일한 날 등록 테스트', async ({ page }) => {
      await page.getByLabel(/제목/).fill('30일 특별 기념일');
      await page.getByLabel(/날짜/).fill('2024-11-30');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('매월 동일한 날 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('monthly');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2028-03-01');
      await page.getByLabel(/마지막 날 설정/).selectOption('매월 30일');

      await page.getByTestId('event-submit-button').click();

      await expect(page.getByText('일정이 추가되었습니다.')).toBeVisible();

      await expect(
        page.getByTestId('event-list').getByText('30일 특별 기념일').first()
      ).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2024-11-30').first()).toBeVisible();

      await page.getByLabel('Next').click();

      await expect(
        page.getByTestId('event-list').getByText('30일 특별 기념일').first()
      ).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2024-12-30').first()).toBeVisible();
    });
  });

  test.describe('5. 반복 일정 등록시 매년 말일 및 윤년 테스트', () => {
    test('윤년 2월 29일이 존재하지 않는 연도에는 일정이 추가되지 않는다.', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-02-01T10:00:00'));
      await page.goto('/');

      const isInitialButtonVisible = await page.getByRole('button', { name: '초기화' }).isVisible();
      if (isInitialButtonVisible) {
        await page.getByRole('button', { name: '초기화' }).click();
      }

      await page.getByLabel(/제목/).fill('윤년 테스트');
      await page.getByLabel(/날짜/).fill('2024-02-29');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('윤년 테스트 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('yearly');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2028-03-01');
      await page.getByLabel(/마지막 날 설정/).selectOption('매년 29일');

      await page.getByTestId('event-submit-button').click();

      await expect(page.getByText('일정이 추가되었습니다.')).toBeVisible();

      await expect(page.getByTestId('event-list').getByText('윤년 테스트')).not.toBeVisible();
    });

    test('윤년 2월 29일이 존재하는 연도에는 일정이 추가된다.', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2028-02-20T10:00:00'));
      await page.goto('/');

      await expect(
        page.getByTestId('event-list').getByText('윤년 테스트', { exact: true })
      ).toBeVisible();
      await expect(page.getByText('2028-02-29')).toBeVisible();
    });

    test('매년 말일 등록 테스트', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2025-02-20T10:00:00'));
      await page.goto('/');

      await page.getByRole('button', { name: '초기화' }).click();

      await page.getByLabel(/제목/).fill('매년 말일 테스트');
      await page.getByLabel(/날짜/).fill('2024-02-29');
      await page.getByLabel(/시작 시간/).fill('09:00');
      await page.getByLabel(/종료 시간/).fill('10:00');
      await page.getByLabel(/설명/).fill('매년 말일 테스트 설명');
      await page.getByLabel(/위치/).fill('회의실');
      await page.getByLabel(/카테고리/).selectOption('업무');

      await page.getByText('반복 일정').click();
      await page.getByLabel(/반복 유형/).selectOption('yearly');
      await page.getByLabel(/반복 간격/).fill('1');
      await page.getByLabel(/반복 종료일/).fill('2028-03-01');
      await page.getByLabel(/마지막 날 설정/).selectOption('매월 마지막 날');

      await page.getByTestId('event-submit-button').click();

      await expect(page.getByText('일정이 추가되었습니다.')).toBeVisible();

      await expect(
        page.getByTestId('event-list').getByText('매년 말일 테스트', { exact: true })
      ).toBeVisible();
      await expect(page.getByTestId('event-list').getByText('2025-02-28')).toBeVisible();
    });
  });
});
