import { vi } from 'vitest';

import {
  add,
  applyDiscount,
  calculateFinalAmount,
  calculateTotal,
  CartItem,
  contains,
  fetchData,
  findMax,
  reverseString,
} from '../utils/practice';

const cart: CartItem[] = [
  {
    name: '쏙쏙 들어오는 함수형 코딩',
    price: 35000,
    quantity: 2,
  },
  {
    name: '프로그래머, 열정을 말하다',
    price: 14000,
    quantity: 1,
  },
];

// 장바구니
describe('장바구니 총합계산 calculateTotal', () => {
  it('장바구니의 총합을 계산합니다', () => {
    console.log('calculateTotal(cart)', calculateTotal(cart));

    expect(calculateTotal(cart)).toBe(84000);
  });

  it('장바구니에 상품이 없으면 0을 반환합니다', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('장바구니 데이터에 문자열이 포함된 경우 NaN을 반환합니다.', () => {
    const result = calculateTotal([
      {
        name: '프로그래머, 열정을 말하다',
        price: '14000' as any,
        quantity: 1,
      },
    ]);
    expect(result).toBeNaN();
  });
});

describe('할인 적용 applyDiscount', () => {
  it('할인금액을 정확하게 반환합니다.', () => {
    expect(applyDiscount(10000, 0.5)).toBe(5000);
  });

  it('전달된 할인율이 문자열이라면 타입 에러가 발생합니다.', () => {
    expect(() => applyDiscount(10000, '0.5' as any)).toThrow(TypeError);
  });

  it('할인율이 0인 경우 금액은 변경되지 않습니다.', () => {
    expect(applyDiscount(10000, 0)).toBe(10000);
  });

  it('할인율이 100인경우 금액은 0이 됩니다.', () => {
    expect(applyDiscount(10000, 1)).toBe(0);
  });

  it('할인율이 범위를 벗어나면 TypeError를 던집니다.', () => {
    expect(() => applyDiscount(10000, -0.1)).toThrow(TypeError);
    expect(() => applyDiscount(10000, 1.5)).toThrow(TypeError);
  });
});

// 통합테스트
describe('할인 적용 후 최종 금액 계산 calculateFinalAmount', () => {
  it('장바구니의 총합을 정확하게 계산합니다.', () => {
    const cart: CartItem[] = [
      { name: 'item1', price: 10000, quantity: 2 },
      { name: 'item2', price: 15000, quantity: 1 },
    ];
    expect(calculateTotal(cart)).toBe(35000);
  });

  it('유효하지 않은 값이 있으면 NaN을 반환합니다.', () => {
    const cart: CartItem[] = [{ name: 'item1', price: '10000' as any, quantity: 2 }];
    expect(calculateTotal(cart)).toBeNaN();
  });

  it('할인가가 적용된 최종 금액을 정확하게 반환합니다.', () => {
    const cart: CartItem[] = [
      { name: 'item1', price: 10000, quantity: 2 },
      { name: 'item2', price: 15000, quantity: 1 },
    ];
    const result = calculateFinalAmount(cart, 0.3);
    expect(result).toBe(24500); // 35000 * 0.7 = 24500
  });

  it('할인율이 유효하지 않으면 TypeError가 발생합니다.', () => {
    const cart: CartItem[] = [
      { name: 'item1', price: 10000, quantity: 2 },
      { name: 'item2', price: 15000, quantity: 1 },
    ];
    expect(() => calculateFinalAmount(cart, -0.5)).toThrow(TypeError);
    expect(() => calculateFinalAmount(cart, 1.5)).toThrow(TypeError);
  });
});

// 비동기 함수
describe('fetchData', () => {
  it('정상적으로 데이터 반환을 한다.', async () => {
    const result = await fetchData('https://mockurl.com');
    expect(result).toEqual({ data: 'mock data' });
  });

  it('비동기 함수가 1초 후 mock 데이터를 반환한다.', async () => {
    vi.useFakeTimers(); // 가짜 타이머 사용
    const fetchPromise = fetchData('https://mockurl.com'); // 비동기 함수 호출

    vi.advanceTimersByTime(1000); // 타이머 1초 후 진행
    const result = await fetchPromise;
    expect(result).toEqual({ data: 'mock data' });

    vi.useRealTimers();
  });
});

// 기타 유틸 함수
describe('숫자의 덧셈 함수', () => {
  it('소숫점의 덧셈을 정확하게 처리합니다.', () => {
    expect(add(0.2, 1)).toBe(1.2);
  });

  it('소숫점, add(0.2, 1)은 1.2를 반환합니다.', () => {
    expect(add(0.2, 1)).toBe(1.2);
  });

  it('음수, add(0, -3)은 -3을 반환합니다.', () => {
    expect(add(0, -3)).toBe(-3);
  });

  it('add(0, 0)은 0을 반환합니다.', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('add(Infinity, 1000)은 Infinity를 반환합니다.', () => {
    expect(add(Infinity, 1000)).toBe(Infinity);
  });

  it('add(NaN, 2)은 NaN을 반환합니다.', () => {
    expect(add(NaN, 2)).toBeNaN();
  });
});

// 문자열 반전 함수
describe('문자열 반전 함수', () => {
  it('입력이 문자열이 아닐 경우 TypeError가 발생합니다.', () => {
    expect(() => reverseString(123 as any)).toThrow(TypeError);
    expect(() => reverseString([] as any)).toThrow(TypeError);
    expect(() => reverseString({} as any)).toThrow(TypeError);
  });

  it('빈문자를 전달하면 빈문자가 반환됩니다.', () => {
    expect(reverseString('')).toBe('');
  });

  it('일반 문자열을 전달하면 반전된 문자열이 반환됩니다.', () => {
    expect(reverseString('react')).toBe('tcaer');
  });

  it('특수문자가 포함된 문자를 전달하면 반전된 문자열이 반환됩니다.', () => {
    expect(reverseString('react!')).toBe('!tcaer');
  });

  it('공백이 포함된 문자를 전달하면 반전된 문자열이 반환됩니다.', () => {
    expect(reverseString('r e a c t')).toBe('t c a e r');
  });

  it('대소문자가 포함된 문자를 전달하면 반전된 문자열이 반환됩니다.', () => {
    expect(reverseString('ReacT')).toBe('TcaeR');
  });

  it('숫자가 포함된 문자열을 전달하면 반전된 문자열이 반환됩니다.', () => {
    expect(reverseString('1r2eact')).toBe('tcae2r1');
  });
});

// 배열 내 최댓값 찾기
describe('배열 내 최댓값 찾기', () => {
  it('빈 배열을 전달하면 null을 반환합니다.', () => {
    expect(findMax([])).toBeNull();
  });

  it('배열이 아닌 값을 전달하면 TypeError가 발생합니다.', () => {
    expect(() => findMax('not an array' as any)).toThrow(TypeError);
    expect(() => findMax({} as any)).toThrow(TypeError);
    expect(() => findMax(123 as any)).toThrow(TypeError);
  });

  it('배열을 전달하면 배열의 최대값을 반환합니다.', () => {
    expect(findMax([1, 2, 3, 4, 5])).toBe(5);
  });

  it('음수가 포함된 배열을 전달하면 배열의 최대값을 반환합니다.', () => {
    expect(findMax([1, 2, 3, -4, 5])).toBe(5);
  });

  it('소숫점이 포함된 배열을 전달하면 배열의 최대값을 반환합니다.', () => {
    expect(findMax([0.1, 0.2, 0.3, 4, 0.5])).toBe(4);
  });

  it('Infinity가 포함된 배열을 전달하면 Infinity를 반환합니다.', () => {
    expect(findMax([Infinity, 0.2, 0.3, 4, 0.5])).toBe(Infinity);
  });
});

// 배열에 값이 있는지 확인
describe('배열에 값이 있는지 확인', () => {
  it('빈배열이 전달되면 false를 반환합니다.', () => {
    expect(contains([], 'book')).toBe(false);
  });

  it('null이 전달되면 타입에러를 반환합니다.', () => {
    expect(() => contains(null as any, 'book')).toThrow(TypeError);
  });

  it('undefined가 전달되면 타입에러를 반환합니다.', () => {
    expect(() => contains(undefined as any, 'book')).toThrow(TypeError);
  });

  it('전달된 배열에 찾는 값이 있다면 true를 반환합니다.', () => {
    expect(contains(['book', 'pen', 'cup'], 'book')).toBe(true);
  });

  it('전달된 배열에 찾는 값이 없다면 false를 반환합니다.', () => {
    expect(contains(['book', 'pen', 'cup'], 'bag')).toBe(false);
  });
});
