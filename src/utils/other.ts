// [слово для одной единицы, слово для двух единиц, слово для пяти единиц]
export const declWord = (value: number, words: string[], isWordsOnly = false) => {
  const val = Math.abs(value) % 100;
  let num = val % 10;
  if (val > 10 && val < 20) return `${isWordsOnly ? "" : value} ${words[2]}`;
  if (num > 1 && num < 5) return `${isWordsOnly ? "" : value} ${words[1]}`;
  if (num === 1) return `${isWordsOnly ? "" : value} ${words[0]}`;
  return `${isWordsOnly ? "" : value} ${words[2]}`;
};
