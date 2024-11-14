export const getIds = <T extends { id: string }>(array: T[]) => array.map(({ id }) => id);

export const filterByIndex = <T>(array: T[], index: number) => array.filter((_, i) => i !== index);

export const spread = <T>(array: T[], target: T[] | T, position: 'start' | 'end' = 'end') => {
  const targetArray = Array.isArray(target) ? target : [target];
  if (position === 'start') return [...targetArray, ...array];
  return [...array, ...targetArray];
};
