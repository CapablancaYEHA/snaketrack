// [слово для одной единицы, слово для двух единиц, слово для пяти единиц]
export const declWord = (value: number, words: string[]) => {
  const val = Math.abs(value) % 100;
  let num = val % 10;
  if (val > 10 && val < 20) return `${value} ${words[2]}`;
  if (num > 1 && num < 5) return `${value} ${words[1]}`;
  if (num === 1) return `${value} ${words[0]}`;
  return `${value} ${words[2]}`;
};
