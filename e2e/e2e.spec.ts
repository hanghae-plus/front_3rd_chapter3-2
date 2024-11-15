import { exec } from 'child_process';
import { promisify } from 'util';

import { test, expect } from '@playwright/test';
import waitOn from 'wait-on';

const waitOnPromise = promisify(waitOn);

let serverProcess;
let clientProcess;

test.describe.serial('e2e 테스트', () => {
  test.beforeAll(async () => {
    // 먼저 서버를 실행하도록 함
    serverProcess = exec('npx nodemon server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Server error: ${error.message}`);
      }
      if (stderr) {
        console.error(`Server stderr: ${stderr}`);
      }
      console.log(`Server stdout: ${stdout}`);
    });

    // 그 다음 클라이언트를 실행하도록 함
    clientProcess = exec('pnpm dev', (error, stdout, stderr) => {
      if (error) {
        console.error(`Client error: ${error.message}`);
      }
      if (stderr) {
        console.error(`Client stderr: ${stderr}`);
      }
      console.log(`Client stdout: ${stdout}`);
    });

    // 클라이언트가 준비될 때까지 대기
    await waitOnPromise({
      resources: ['http://localhost:5173'],
      timeout: 10000,
    });
  });

  test('1. 사용자에게 웹서비스가 정상적으로 로드 되어야한다.', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('2. 사용자가 반복 일정을 추가했다가, 특정 일정의 반복을 해제하고, 해당 일정의 날짜를 수정할 수 있어야 한다.', async ({
    page,
  }) => {
    test.setTimeout(100000);
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: '모든 일정 삭제' }).click();
    await page.reload();

    {
      /* 첫 반복 일정 등록은 매주 도서관에서 공부하는 일정으로 등록하기 */
    }
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('정원이랑 공부하기');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('11:00');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').fill('23:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('나는 회사일이랑 사이드프로젝트 개발해보기');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('한림대학교 도서관');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.locator('span').first().click();
    await page.getByLabel('반복 유형').selectOption('weekly');
    await page.getByTestId('event-submit-button').click();

    {
      /* 첫 반복 일정에 대해 캘린더에 일정이 존재함 */
    }
    await page.getByRole('cell', { name: '14 정원이랑 공부하기' }).click();
    await page.getByRole('cell', { name: '21 정원이랑 공부하기' }).click();
    await page.getByRole('cell', { name: '28 정원이랑 공부하기' }).click();

    {
      /* 반복 일정 하나를 수정하여 축제 일정으로 변경 */
    }
    await page.getByLabel('Edit event').first().click();
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('정원이랑 축제 가기');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('자라섬재즈축제가야지~');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('가평');

    {
      /* 변경하려는 날짜에 대해 반복 해제 */
    }
    await page.getByLabel('반복 간격').click();
    await page.getByLabel('반복 간격').fill('0');
    await page.getByTestId('event-submit-button').click();

    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 축제 가기2024-11-1411:00 -' })
      .nth(1)
      .click();
    await page.getByRole('cell', { name: '정원이랑 축제 가기' }).click();

    {
      /* 축제 내용으로 변경했지만 날짜가 주말인 관계로, 날짜를 변경 */
    }
    await page.getByLabel('Edit event').first().click();
    await page.getByLabel('날짜').fill('2024-11-17');
    await page.getByTestId('event-submit-button').click();

    {
      /* 2차로 날짜를 변경한 날짜로 축제 일정 표시됨 */
    }
    await page.getByRole('cell', { name: '정원이랑 축제 가기' }).click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 축제 가기2024-11-1611:00 -' })
      .nth(1)
      .click();

    {
      /* 첫 반복 일정에 대해 다른 반복 날짜로 캘린더에 일정이 존재함 */
    }
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 공부하기2024-11-2111:00 - 23' })
      .nth(1)
      .click();
  });

  test('3. 사용자가 2일, 3일 간격의 일정을 등록했을 때, 두 개의 일정이 겹치는 날짜는 서로 최소공배수 날짜 간격으로 겹쳐야하고 해당 날짜에 두 일정이 모두 표시되어야 한다.', async ({
    page,
  }) => {
    test.setTimeout(100000);
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: '모든 일정 삭제' }).click();
    await page.reload();

    await page.getByLabel('제목').fill('정원이랑 밥먹기');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('18:00');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').fill('20:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('정원이랑 2일에 1번은 밥먹자...');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('서울 어딘가');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.locator('span').first().click();

    await page.getByLabel('반복 간격').click();
    await page.getByLabel('반복 간격').fill('02');
    await page.getByTestId('event-submit-button').click();

    {
      /* 첫 번째로 2일 간격으로 발생하는 반복 일정에 대해 캘린더에 일정이 존재함 */
    }
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-1418:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-1618:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-1818:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-2018:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-2218:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-2418:00 - 20:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 밥먹기2024-11-2618:00 - 20:' })
      .first()
      .click();

    {
      /* 두 번째로 3일 간격으로 발생하는 반복 일정 등록 */
    }
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('정원이랑 운동하기');
    await page.getByLabel('날짜').fill('2024-11-12');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowLeft');
    await page.getByLabel('시작 시간').press('ArrowLeft');
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('3일에 한번은 정원이랑 운동하자');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('광나루 한강 공원');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.locator('span').first().click();
    await page.getByLabel('반복 간격').click();
    await page.getByLabel('반복 간격').fill('03');
    await page.getByTestId('event-submit-button').click();

    {
      /* 두 반복 일정이 겹치는 날짜의 특징은 서로 6일 간격으로 겹침 */
    }
    await page.getByRole('cell', { name: '14 정원이랑 밥먹기 정원이랑 운동하기' }).click();
    await page.getByRole('cell', { name: '20 정원이랑 밥먹기 정원이랑 운동하기' }).click();
    await page.getByRole('cell', { name: '26 정원이랑 밥먹기 정원이랑 운동하기' }).click();
  });

  test('4. 사용자가 첫 일정을 등록 후 일정이 겹치게 두 번째 일정을 등록해 경고창이 떴지만 그대로 일정을 등록하고, 겹치는 날짜에 특정 일정 중에 하나 수정해 겹치지 않도록 일정을 조율할 수 있어야한다.', async ({
    page,
  }) => {
    test.setTimeout(100000);
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: '모든 일정 삭제' }).click();
    await page.reload();

    {
      /* 첫 번째 일정 등록 */
    }
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('정원이랑 놀기');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('01:00');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowDown');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').fill('06:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('정원이랑은 3일에 한번은 꾸준히 놀자..');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('서울');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.locator('span').first().click();
    await page.getByLabel('반복 간격').click();
    await page.getByLabel('반복 간격').fill('03');
    await page.getByTestId('event-submit-button').click();

    {
      /* 첫 번째 일정에 대해 캘린더에 일정이 존재함 */
    }
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-1401:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-1701:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2001:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2301:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2601:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2901:00 - 06:' })
      .first()
      .click();

    {
      /* 기존에 있는 첫 번째 일정과 겹치는 두 번째 일정 등록 */
    }
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('다은이랑 놀기');
    await page.getByLabel('날짜').fill('2024-11-21');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowLeft');
    await page.getByLabel('시작 시간').press('ArrowLeft');
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('01:00');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowLeft');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').fill('02:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('다은이랑 진짜 오랜만에 놀기');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('천호');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.getByTestId('event-submit-button').click();

    {
      /* 겹치는 날짜와, 시간대라 경고창이 뜨고, 계속 진행 버튼을 눌러 일정을 등록 */
    }
    await page.getByText('다음 일정과 겹칩니다:정원이랑 놀기 (2024-11-').click();
    await page.getByRole('button', { name: '계속 진행' }).click();

    {
      /* 우선 일정이 겹치지만 둘다 등록이 되어있음 */
    }
    await page.getByRole('cell', { name: '정원이랑 놀기 다은이랑 놀기' }).click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2001:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '다은이랑 놀기2024-11-2001:00 - 02:' })
      .first()
      .click();

    {
      /* 첫 번째 일정을 수정하여 두 번째 일정과 겹치지 않도록 시간대를 변경 */
    }
    await page.locator('div:nth-child(4) > div > div:nth-child(2) > button').first().click();
    await page.locator('label').filter({ hasText: '반복 일정' }).locator('svg').click();
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('03:00');
    await page.getByTestId('event-submit-button').click();

    {
      /* 첫 번째 일정과 두 번째 일정이 겹치지 않도록 수정됨 */
    }
    await page.getByRole('cell', { name: '정원이랑 놀기 다은이랑 놀기' }).click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '정원이랑 놀기2024-11-2003:00 - 06:' })
      .first()
      .click();
    await page
      .getByTestId('event-list')
      .locator('div')
      .filter({ hasText: '다은이랑 놀기2024-11-2001:00 - 02:' })
      .first()
      .click();
  });

  test.afterAll(() => {
    // 프로세스 종료
    if (serverProcess) {
      serverProcess.kill();
    }
    if (clientProcess) {
      clientProcess.kill();
    }
  });
});
