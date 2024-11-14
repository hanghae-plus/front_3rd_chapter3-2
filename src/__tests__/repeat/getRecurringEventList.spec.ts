import { getRecurringEventList } from '../../feature/addOrEdit/@utils';

describe('getRecurringEventList 테스트', () => {
  describe('"일" 기준 반복 일정 설정', () => {
    describe('기준 일에 대해 올바르게 처리한다.', () => {
      it('시작일은 2024년 11월 01일 반복 간격은 1일, 종료일은 2024년 11월 20일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-20',
          interval: 1,
          type: 'daily',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2024-11-02',
          '2024-11-03',
          '2024-11-04',
          '2024-11-05',
          '2024-11-06',
          '2024-11-07',
          '2024-11-08',
          '2024-11-09',
          '2024-11-10',
          '2024-11-11',
          '2024-11-12',
          '2024-11-13',
          '2024-11-14',
          '2024-11-15',
          '2024-11-16',
          '2024-11-17',
          '2024-11-18',
          '2024-11-19',
          '2024-11-20',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 2일, 종료일은 2024년 11월 20일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-20',
          interval: 2,
          type: 'daily',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2024-11-03',
          '2024-11-05',
          '2024-11-07',
          '2024-11-09',
          '2024-11-11',
          '2024-11-13',
          '2024-11-15',
          '2024-11-17',
          '2024-11-19',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 3일, 종료일은 2024년 11월 20일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-20',
          interval: 3,
          type: 'daily',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2024-11-04',
          '2024-11-07',
          '2024-11-10',
          '2024-11-13',
          '2024-11-16',
          '2024-11-19',
        ]);
      });
    });
  });

  describe('"주" 기준 반복 일정 설정', () => {
    describe('기준 주에 대해 올바르게 처리한다.', () => {
      it('시작일은 2024년 11월 01일 반복 간격은 1주, 종료일은 2024년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          interval: 1,
          type: 'weekly',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2024-11-08',
          '2024-11-15',
          '2024-11-22',
          '2024-11-29',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 2주, 종료일은 2024년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          interval: 2,
          type: 'weekly',
        });

        expect(result).toEqual(['2024-11-01', '2024-11-15', '2024-11-29']);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 3주, 종료일은 2024년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          interval: 3,
          type: 'weekly',
        });

        expect(result).toEqual(['2024-11-01', '2024-11-22']);
      });
    });
  });

  describe('"월" 기준 반복 일정 설정', () => {
    describe('기준 월에 대해 올바르게 처리한다.', () => {
      it('시작일은 2024년 11월 01일 반복 간격은 1달, 종료일은 2025년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2025-11-30',
          interval: 1,
          type: 'monthly',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2024-12-01',
          '2025-01-01',
          '2025-02-01',
          '2025-03-01',
          '2025-04-01',
          '2025-05-01',
          '2025-06-01',
          '2025-07-01',
          '2025-08-01',
          '2025-09-01',
          '2025-10-01',
          '2025-11-01',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 2달, 종료일은 2025년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2025-11-30',
          interval: 2,
          type: 'monthly',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2025-01-01',
          '2025-03-01',
          '2025-05-01',
          '2025-07-01',
          '2025-09-01',
          '2025-11-01',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 3달, 종료일은 2025년 11월 30일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2025-11-30',
          interval: 3,
          type: 'monthly',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2025-02-01',
          '2025-05-01',
          '2025-08-01',
          '2025-11-01',
        ]);
      });
    });

    describe('시작일이 말일일 경우 해당 달의 마지막날로 계산한다', () => {
      it('시작일은 2023년 2월 28일, 반복 간격은 1달, 종료일은 2023년 12월 31일', () => {
        const result = getRecurringEventList({
          startDate: '2023-02-28',
          endDate: '2023-12-31',
          interval: 1,
          type: 'monthly',
        });
        expect(result).toEqual([
          '2023-02-28',
          '2023-03-28',
          '2023-04-28',
          '2023-05-28',
          '2023-06-28',
          '2023-07-28',
          '2023-08-28',
          '2023-09-28',
          '2023-10-28',
          '2023-11-28',
          '2023-12-28',
        ]);
      });

      it('시작일은 2024년 2월 29일, 반복 간격은 1달, 종료일은 2025년 4월 01일', () => {
        const result = getRecurringEventList({
          startDate: '2024-02-29',
          endDate: '2025-04-01',
          interval: 1,
          type: 'monthly',
        });
        expect(result).toEqual([
          '2024-02-29',
          '2024-03-29',
          '2024-04-29',
          '2024-05-29',
          '2024-06-29',
          '2024-07-29',
          '2024-08-29',
          '2024-09-29',
          '2024-10-29',
          '2024-11-29',
          '2024-12-29',
          '2025-01-29',
          '2025-02-28',
          '2025-03-28',
        ]);
      });

      it('시작일은 2024년 4월 30일, 반복 간격은 1달, 종료일은 2025년 3월 01일', () => {
        const result = getRecurringEventList({
          startDate: '2023-02-28',
          endDate: '2023-12-31',
          interval: 1,
          type: 'monthly',
        });
        expect(result).toEqual([
          '2023-02-28',
          '2023-03-28',
          '2023-04-28',
          '2023-05-28',
          '2023-06-28',
          '2023-07-28',
          '2023-08-28',
          '2023-09-28',
          '2023-10-28',
          '2023-11-28',
          '2023-12-28',
        ]);
      });

      it('시작일은 2024년 3월 31일, 반복 간격은 1달, 종료일은 2025년 3월 01일', () => {
        const result = getRecurringEventList({
          startDate: '2023-02-28',
          endDate: '2023-12-31',
          interval: 1,
          type: 'monthly',
        });
        expect(result).toEqual([
          '2023-02-28',
          '2023-03-28',
          '2023-04-28',
          '2023-05-28',
          '2023-06-28',
          '2023-07-28',
          '2023-08-28',
          '2023-09-28',
          '2023-10-28',
          '2023-11-28',
          '2023-12-28',
        ]);
      });
    });
  });

  describe('"연" 기준 반복 일정 설정', () => {
    describe('기준주에 대해 올바르게 처리한다.', () => {
      it('시작일은 2024년 11월 01일 반복 간격은 1년, 종료일은 2030년 11월 01일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2030-11-01',
          interval: 1,
          type: 'yearly',
        });

        expect(result).toEqual([
          '2024-11-01',
          '2025-11-01',
          '2026-11-01',
          '2027-11-01',
          '2028-11-01',
          '2029-11-01',
          '2030-11-01',
        ]);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 2년, 종료일은 2030년 11월 01일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2030-11-01',
          interval: 2,
          type: 'yearly',
        });

        expect(result).toEqual(['2024-11-01', '2026-11-01', '2028-11-01', '2030-11-01']);
      });

      it('시작일은 2024년 11월 01일 반복 간격은 3년, 종료일은 2030년 11월 01일로 설정', () => {
        const result = getRecurringEventList({
          startDate: '2024-11-01',
          endDate: '2030-11-01',
          interval: 3,
          type: 'yearly',
        });

        expect(result).toEqual(['2024-11-01', '2027-11-01', '2030-11-01']);
      });
    });
  });
});
