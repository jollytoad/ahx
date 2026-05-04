export function getRandomItem(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function getRandomRow(...lists: string[][]): string[] {
  return lists.map((list) => getRandomItem(list));
}

export function* getRandomRows(
  count: number,
  ...lists: string[][]
): Iterable<string[]> {
  for (let i = 0; i < count; i++) {
    yield getRandomRow(...lists);
  }
}
