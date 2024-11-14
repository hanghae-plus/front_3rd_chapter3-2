export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

// 장바구니 리듀서 함수: 총합 계산
export function calculateTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return NaN;
    }
    return total + item.price * item.quantity;
  }, 0);
}

// 할인 적용 함수
export function applyDiscount(total: number, discount: number): number {
  if (typeof discount !== 'number' || discount < 0 || discount > 1) {
    throw new TypeError('Discount must be a number between 0 and 1');
  }
  return total * (1 - discount);
}

// 장바구니 상품과 할인 적용 후 최종 금액 계산
export function calculateFinalAmount(cart: CartItem[], discount: number): number {
  const total = calculateTotal(cart);

  if (isNaN(total)) {
    throw new Error('Total amount calculation failed');
  }

  if (typeof discount !== 'number' || discount < 0 || discount > 1) {
    throw new TypeError('Discount must be a number between 0 and 1');
  }

  return applyDiscount(total, discount);
}

// 비동기 함수
export function fetchData(url: string): Promise<{ data: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'mock data' });
    }, 1000);
  });
}

// 기타 유틸함수들..
export function add(a: number, b: number): number {
  return a + b;
}

// 문자열 반전 함수
export function reverseString(str: string): string {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return str.split('').reverse().join('');
}

// 배열 내 최댓값 찾기
export function findMax(arr: number[]): number | null {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }

  if (arr.length === 0) return null; // 빈배열 null 반환
  return Math.max(...arr);
}

// 배열에 값이 있는지 확인
export function contains(arr: any[], value: any): boolean {
  if (!Array.isArray(arr)) {
    throw new TypeError('First argument must be an array');
  }

  return arr.includes(value);
}

// TODO: 좀 더 연습해볼것.
// 상태 관리: useState 또는 useReducer를 사용하여 상태 변화와 이벤트 핸들링 테스트
// 디바운싱: 연속적인 입력에 대해 일정 시간 후 동작하도록 설정한 함수 테스트
// 고차 함수: 함수 인자를 받고 다른 함수를 반환하거나 실행하는 함수 테스트
// 순차적 작업 처리: Promise.all 등을 사용해 병렬 비동기 작업 테스트
