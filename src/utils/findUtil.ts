export function findEventIndexById(array: any[], id: string) {
  return array.findIndex((event) => event.id === id);
}
